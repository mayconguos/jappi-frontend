'use client';

import ExcelJS from 'exceljs';
import type { LocationCatalog } from '@/hooks/useLocationCatalog';
import { MIN_COMPATIBLE_VERSION, TEMPLATE_VERSION_LABEL } from './template-version';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface BulkShipmentRow {
  /** Índice de fila en el Excel (para mostrar al usuario, base 2) */
  rowIndex: number;
  // Campos raw del Excel
  customer_name: string;
  phone: string;
  address: string;
  id_region: number;
  id_district: number;
  id_sector: number;
  reference: string;
  service_type: string;
  shipping_mode: string;
  date: string;
  total_amount: number | null;
  payment_method: string;
  payment_destination: string;
  product_name: string;
  quantity: number;
  notes: string;
  // Resultado de validación
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export type ParseResult = {
  rows: BulkShipmentRow[];
  totalRows: number;
  validCount: number;
  errorCount: number;
};

// ─── Parser ───────────────────────────────────────────────────────────────────

export async function parseShipmentExcel(
  file: File,
  catalog: LocationCatalog | null
): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // ── Version validation ────────────────────────────────────────────────────
  const metaSheet = workbook.getWorksheet('_meta');
  if (!metaSheet) {
    throw new Error(
      'Este archivo no es la plantilla oficial de Japi Express. ' +
      `Descarga la plantilla ${TEMPLATE_VERSION_LABEL} desde el Paso 1.`
    );
  }
  const fileVersion = Number(metaSheet.getCell('A1').value);
  if (isNaN(fileVersion) || fileVersion < MIN_COMPATIBLE_VERSION) {
    throw new Error(
      `Plantilla desactualizada (versión detectada: v${fileVersion || '?'}). ` +
      `Se requiere la ${TEMPLATE_VERSION_LABEL} o superior. ` +
      'Descarga la versión más reciente desde el Paso 1.'
    );
  }

  // ── Find the data sheet by name (fallback to first sheet) ─────────────────
  const sheet =
    workbook.getWorksheet('Envíos') ??
    workbook.worksheets.find((ws) => ws.name !== '_meta' && ws.name !== 'Catálogo') ??
    null;
  if (!sheet) throw new Error('El archivo no contiene la hoja "Envíos" esperada.');

  const rows: BulkShipmentRow[] = [];

  sheet.eachRow((row, rowNumber) => {
    // Saltar header (fila 1) y filas completamente vacías
    if (rowNumber === 1) return;

    const values = row.values as any[];
    // ExcelJS usa índice base 1 para row.values (índice 0 = undefined)
    const get = (col: number): string =>
      (values[col] != null ? String(values[col]).trim() : '');
    const getNum = (col: number): number | null => {
      const v = values[col];
      if (v == null || v === '') return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };

    const customer_name = get(1);
    const phone = get(2);
    const address = get(3);
    const location_name = get(4);
    
    let id_region = 0;
    let id_district = 0;
    let id_sector = 0;

    const reference = get(8);
    const service_type = get(9);
    const shipping_mode = get(10) || 'solo entregar';
    
    // ── Date parsing (Col 10) ──
    const rawDate = values[10];
    let date = '';
    if (rawDate instanceof Date) {
      date = rawDate.toISOString().split('T')[0];
    } else if (typeof rawDate === 'number') {
      // Excel serial date (basic conversion)
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const d = new Date(excelEpoch.getTime() + rawDate * 86400000);
      date = d.toISOString().split('T')[0];
    } else {
      date = get(11);
    }

    const total_amount = getNum(12);
    const payment_method = get(13);
    const payment_destination = get(14);
    const product_name = get(15);
    const quantity = getNum(16) ?? 0;
    const notes = get(17);

    // Omitir filas completamente vacías
    if (!customer_name && !phone && !address && !product_name) return;

    const errors: string[] = [];
    const warnings: string[] = [];

    // ── Validaciones de campos requeridos ──────────────────────────────────
    if (!customer_name) errors.push('Nombre destinatario requerido');
    if (!phone) {
      errors.push('Teléfono requerido');
    } else if (!/^9\d{8}$/.test(phone.replace(/\s/g, ''))) {
      errors.push('Teléfono inválido (debe tener 9 dígitos y empezar con 9)');
    }
    if (!address) {
      errors.push('Dirección requerida');
    } else if (address.length > 225) {
      errors.push('La dirección no debe exceder los 225 caracteres');
    }

    if (reference && reference.length > 225) {
      errors.push('La referencia no debe exceder los 225 caracteres');
    }

    if (!service_type) {
      errors.push('Tipo de servicio requerido');
    } else if (!['regular', 'cambio'].includes(service_type)) {
      errors.push(`Tipo de servicio inválido: "${service_type}" (use: regular / cambio)`);
    }

    if (!['solo entregar', 'contraentrega'].includes(shipping_mode)) {
      errors.push(`Modo de entrega inválido: "${shipping_mode}" (use: solo entregar / contraentrega)`);
    }

    if (!date) {
      errors.push('Fecha de entrega requerida');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Formato de fecha inválido: "${date}" (use: YYYY-MM-DD)`);
    }

    if (!product_name) errors.push('Nombre de producto requerido');
    if (!quantity || quantity <= 0) errors.push('Cantidad de producto debe ser mayor a 0');

    // ── Validaciones COD ──────────────────────────────────────────────────
    if (shipping_mode === 'contraentrega') {
      if (!total_amount || total_amount <= 0) {
        errors.push('Monto COD requerido para "contraentrega"');
      }

      const validMethods = ['Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin'];
      if (!payment_method) {
        errors.push('Método de pago requerido para "contraentrega"');
      } else if (!validMethods.includes(payment_method)) {
        errors.push(`Método de pago inválido: "${payment_method}" (use: ${validMethods.join(' / ')})`);
      }

      const validForms = ['Abono a Japi', 'Abono a vendedor'];
      if (!payment_destination) {
        errors.push('Forma de pago requerida para "contraentrega"');
      } else if (!validForms.includes(payment_destination)) {
        errors.push(`Forma de pago inválida: "${payment_destination}" (use: ${validForms.join(' / ')})`);
      }
    }

    // ── Resolución de jerarquía con catálogo ────────────────────────────
    if (catalog && location_name) {
      let found = false;
      const searchName = location_name.toLowerCase().trim();

      // 1. Buscar en sectores (más específico)
      outerSector: for (const r of catalog) {
        for (const d of r.districts) {
          const match = d.sectors.find(s => s.sector_name.toLowerCase().trim() === searchName);
          if (match) {
            id_region = r.id_region;
            id_district = d.id_district;
            id_sector = match.id_sector;
            found = true;
            break outerSector;
          }
        }
      }

      // 2. Si no es sector, buscar en distritos
      if (!found) {
        outerDist: for (const r of catalog) {
          const match = r.districts.find(d => d.district_name.toLowerCase().trim() === searchName);
          if (match) {
            id_region = r.id_region;
            id_district = match.id_district;
            id_sector = 0;
            found = true;
            break outerDist;
          }
        }
      }

      if (!found) {
        errors.push(`Ubicación "${location_name}" no encontrada en el catálogo (buscado como Sector y Distrito)`);
      }
    } else if (!location_name) {
      errors.push('Ubicación (Nombre) requerido');
    } else {
      warnings.push('Catálogo no disponible: no se pudo validar la jerarquía de la ubicación');
    }

    // Validar que finalmente tengamos una ubicación resuelta
    if (!id_region && !id_district) {
      errors.push('ID Ubicación no válido o campo vacío');
    }

    rows.push({
      rowIndex: rowNumber,
      customer_name,
      phone,
      address,
      id_region,
      id_district,
      id_sector,
      reference,
      service_type,
      shipping_mode,
      date,
      total_amount,
      payment_method,
      payment_destination,
      product_name,
      quantity,
      notes,
      errors,
      warnings,
      isValid: errors.length === 0,
    });
  });

  const validCount = rows.filter(r => r.isValid).length;
  return {
    rows,
    totalRows: rows.length,
    validCount,
    errorCount: rows.length - validCount,
  };
}

// ─── Transformación a payload de API ─────────────────────────────────────────

export function rowToApiPayload(row: BulkShipmentRow, idCompany: number | string) {
  const isCod = row.shipping_mode === 'contraentrega';

  return {
    id_company: idCompany,
    origin_type: 'bulk',
    service_type: row.service_type,
    shipping_mode: row.shipping_mode === 'contraentrega' ? 'pay_on_delivery' : 'delivery_only',
    date: row.date,
    customer_name: row.customer_name,
    phone: row.phone,
    address: {
      address: row.address,
      id_region: row.id_region,
      id_district: row.id_district,
      id_sector: row.id_sector || 0,
      reference: row.reference || '',
    },
    products: [
      {
        product_name: row.product_name,
        quantity: row.quantity,
      },
    ],
    ...(row.notes ? { notes: row.notes } : {}),
    ...(isCod
      ? {
          total_amount: row.total_amount,
          payment_method:
            {
              Efectivo: 'cash',
              Tarjeta: 'card',
              Transferencia: 'transfer',
              Yape: 'yape',
              Plin: 'plin',
            }[row.payment_method] || 'cash',
          payment_destination:
            {
              'Abono a Japi': 'japi_payment',
              'Abono a vendedor': 'seller_payment',
            }[row.payment_destination] || 'seller_payment',
        }
      : {}),
  };
}
