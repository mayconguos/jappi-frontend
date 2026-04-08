'use client';

import ExcelJS from 'exceljs';

/**
 * Genera y descarga la plantilla Excel para carga masiva de envíos.
 * Incluye Data Validations nativas para campos con opciones fijas,
 * headers descriptivos y una fila de ejemplo.
 */
export async function downloadBulkShipmentTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Japi Express';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Envíos');

  // ─── Definición de columnas ────────────────────────────────────────────────
  sheet.columns = [
    { header: 'Nombre Destinatario *', key: 'customer_name', width: 28 },
    { header: 'Teléfono *', key: 'phone', width: 16 },
    { header: 'Dirección *', key: 'address', width: 32 },
    { header: 'ID Región *', key: 'id_region', width: 12 },
    { header: 'ID Distrito *', key: 'id_district', width: 14 },
    { header: 'ID Sector', key: 'id_sector', width: 12 },
    { header: 'Referencia', key: 'reference', width: 24 },
    { header: 'Tipo de Servicio *', key: 'service_type', width: 20 },
    { header: 'Modo de Entrega *', key: 'shipping_mode', width: 22 },
    { header: 'Fecha de Entrega * (YYYY-MM-DD)', key: 'date', width: 28 },
    { header: 'Monto COD', key: 'total_amount', width: 14 },
    { header: 'Método de Pago', key: 'payment_method', width: 18 },
    { header: 'Forma de Pago', key: 'payment_destination', width: 18 },
    { header: 'Producto 1 - Nombre *', key: 'product_name', width: 26 },
    { header: 'Producto 1 - Cantidad *', key: 'quantity', width: 22 },
    { header: 'Notas', key: 'notes', width: 28 },
  ];

  // ─── Estilos del header ────────────────────────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const isRequired = cell.value?.toString().includes('*');
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isRequired ? 'FFFFF3CD' : 'FFE9ECEF' }, // amarillo=req, gris=opcional
    };
    cell.font = {
      bold: true,
      size: 11,
      color: { argb: isRequired ? 'FF856404' : 'FF495057' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: { style: 'medium', color: { argb: isRequired ? 'FFFFC107' : 'FFADB5BD' } },
    };
  });
  headerRow.height = 40;

  // ─── Fila de ejemplo ──────────────────────────────────────────────────────
  const exampleRow = sheet.addRow({
    customer_name: 'Juan Pérez García',
    phone: '987654321',
    address: 'Av. Lima 123, Int. 5',
    id_region: 1,
    id_district: 15,
    id_sector: 3,
    reference: 'Frente al parque central',
    service_type: 'regular',
    shipping_mode: 'delivery_only',
    date: '2026-05-10',
    total_amount: '',
    payment_method: '',
    payment_destination: '',
    product_name: 'Zapatillas Nike Air Max',
    quantity: 2,
    notes: 'Entregar en horario AM',
  });

  exampleRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0FFF4' }, // verde muy suave
    };
    cell.font = { italic: true, color: { argb: 'FF2D6A4F' }, size: 10 };
    cell.alignment = { vertical: 'middle' };
  });

  // ─── Data Validations ────────────────────────────────────────────────────
  // Tipo de Servicio (col H = 8)
  for (let row = 2; row <= 1000; row++) {
    sheet.getCell(`H${row}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"regular,express"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite: regular o express',
    };

    // Modo de Entrega (col I = 9)
    sheet.getCell(`I${row}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"delivery_only,pay_on_delivery"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite: delivery_only o pay_on_delivery',
    };
  }

  // ─── Anclar primera fila ──────────────────────────────────────────────────
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // ─── Generar y descargar ──────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_carga_masiva_envios.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
