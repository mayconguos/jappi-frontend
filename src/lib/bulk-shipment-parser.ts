'use client';

import ExcelJS from 'exceljs';
import type { LocationCatalog } from '@/hooks/useLocationCatalog';

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

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('El archivo no contiene hojas de cálculo.');

  const rows: BulkShipmentRow[] = [];

  sheet.eachRow((row, rowNumber) => {
    // Saltar header (fila 1) y filas completamente vacías
    if (rowNumber === 1) return;

    const values = row.values as (string | number | null | undefined)[];
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
    const id_region = getNum(4) ?? 0;
    const id_district = getNum(5) ?? 0;
    const id_sector = getNum(6) ?? 0;
    const reference = get(7);
    const service_type = get(8);
    const shipping_mode = get(9);
    const date = get(10);
    const total_amount = getNum(11);
    const payment_method = get(12);
    const payment_destination = get(13);
    const product_name = get(14);
    const quantity = getNum(15) ?? 0;
    const notes = get(16);

    // Omitir filas completamente vacías
    if (!customer_name && !phone && !address && !product_name) return;

    const errors: string[] = [];
    const warnings: string[] = [];

    // ── Validaciones de campos requeridos ──────────────────────────────────
    if (!customer_name) errors.push('Nombre destinatario requerido');
    if (!phone) {
      errors.push('Teléfono requerido');
    } else if (!/^\d{7,15}$/.test(phone.replace(/\s/g, ''))) {
      errors.push('Teléfono inválido (solo dígitos, 7-15 caracteres)');
    }
    if (!address) errors.push('Dirección requerida');
    if (!id_region) errors.push('ID Región requerido');
    if (!id_district) errors.push('ID Distrito requerido');

    if (!service_type) {
      errors.push('Tipo de servicio requerido');
    } else if (!['regular', 'express'].includes(service_type)) {
      errors.push(`Tipo de servicio inválido: "${service_type}" (use: regular / express)`);
    }

    if (!shipping_mode) {
      errors.push('Modo de entrega requerido');
    } else if (!['delivery_only', 'pay_on_delivery'].includes(shipping_mode)) {
      errors.push(`Modo de entrega inválido: "${shipping_mode}" (use: delivery_only / pay_on_delivery)`);
    }

    if (!date) {
      errors.push('Fecha de entrega requerida');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Formato de fecha inválido: "${date}" (use: YYYY-MM-DD)`);
    }

    if (!product_name) errors.push('Nombre de producto requerido');
    if (!quantity || quantity <= 0) errors.push('Cantidad de producto debe ser mayor a 0');

    // ── Validaciones COD ──────────────────────────────────────────────────
    if (shipping_mode === 'pay_on_delivery') {
      if (!total_amount || total_amount <= 0) errors.push('Monto COD requerido para "pay_on_delivery"');
      if (!payment_method) errors.push('Método de pago requerido para "pay_on_delivery"');
      if (!payment_destination) errors.push('Forma de pago requerida para "pay_on_delivery"');
    }

    // ── Validación de ubicaciones con catálogo ────────────────────────────
    if (catalog) {
      const regionExists = catalog.some(r => r.id_region === id_region);
      if (id_region && !regionExists) {
        errors.push(`Región ID ${id_region} no encontrada en el catálogo`);
      }

      if (regionExists && id_district) {
        const region = catalog.find(r => r.id_region === id_region);
        const districtExists = region?.districts.some(d => d.id_district === id_district);
        if (!districtExists) {
          errors.push(`Distrito ID ${id_district} no pertenece a la Región ${id_region}`);
        } else if (id_sector) {
          const district = region?.districts.find(d => d.id_district === id_district);
          const sectorExists = district?.sectors.some(s => s.id_sector === id_sector);
          if (!sectorExists) {
            warnings.push(`Sector ID ${id_sector} no encontrado en el Distrito ${id_district}`);
          }
        }
      }
    } else {
      warnings.push('Catálogo de ubicaciones no disponible: no se validaron región/distrito/sector');
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
  const isCod = row.shipping_mode === 'pay_on_delivery';

  return {
    id_company: idCompany,
    origin_type: 'bulk',
    service_type: row.service_type,
    shipping_mode: row.shipping_mode,
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
          payment_method: row.payment_method,
          payment_destination: row.payment_destination,
        }
      : {}),
  };
}
