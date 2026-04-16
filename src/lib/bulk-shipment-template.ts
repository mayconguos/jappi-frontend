'use client';

import ExcelJS from 'exceljs';
import type { LocationCatalog } from '@/hooks/useLocationCatalog';
import { CURRENT_TEMPLATE_VERSION, TEMPLATE_VERSION_LABEL } from './template-version';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Apply a consistent header style to a catalog table cell. */
function styleCatHeader(
  cell: ExcelJS.Cell,
  bgArgb: string,
  textArgb = 'FFFFFFFF'
) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
  cell.font = { bold: true, size: 10, color: { argb: textArgb } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.border = { bottom: { style: 'medium', color: { argb: bgArgb } } };
}

/** Apply alternating row fill to catalog data rows for readability. */
function styleCatDataCell(cell: ExcelJS.Cell, rowIndex: number, lightArgb: string) {
  if (rowIndex % 2 === 0) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightArgb } };
  }
  cell.font = { size: 10 };
  cell.alignment = { vertical: 'middle' };
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Generates and downloads the bulk shipment Excel template.
 *
 * @param catalog  Location catalog from the API. If null, the template is
 *                 generated without the Catálogo sheet and without VLOOKUP
 *                 helper columns (the button should be disabled in that case).
 */
export async function downloadBulkShipmentTemplate(
  catalog: LocationCatalog | null
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Japi Express';
  workbook.created = new Date();

  // ── Sheet 1: Envíos ─────────────────────────────────────────────────────
  const MAX_DATA_ROWS = 501; // rows 2–501 (500 shipments max)

  const sheet = workbook.addWorksheet('Envíos');

  sheet.columns = [
    { header: 'Nombre Destinatario *', key: 'customer_name',      width: 28 },
    { header: 'Teléfono *',            key: 'phone',               width: 16 },
    { header: 'Dirección *',           key: 'address',             width: 32 },
    { header: 'Ubicación (Nombre) *',  key: 'location_name',       width: 25 },
    // ── VLOOKUP helper columns (E, F, G) ──
    { header: '✔ Nombre Región',   key: '_region_name',   width: 22 },
    { header: '✔ Nombre Distrito', key: '_district_name', width: 22 },
    { header: '✔ Nombre Sector',   key: '_sector_name',   width: 22 },
    { header: 'Referencia',            key: 'reference',           width: 24 },
    { header: 'Tipo de Servicio *',    key: 'service_type',        width: 20 },
    { header: 'Modo de Entrega *',     key: 'shipping_mode',       width: 22 },
    { header: 'Fecha Entrega * (YYYY-MM-DD)', key: 'date',         width: 26 },
    { header: 'Monto COD',             key: 'total_amount',        width: 14 },
    { header: 'Método de Pago',        key: 'payment_method',      width: 18 },
    { header: 'Forma de Pago',         key: 'payment_destination', width: 18 },
    { header: 'Producto - Nombre *',   key: 'product_name',        width: 26 },
    { header: 'Producto - Cantidad *', key: 'quantity',            width: 22 },
    { header: 'Notas',                 key: 'notes',               width: 28 },
  ];

  // Header row styles
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const isHelper   = colNumber >= 5 && colNumber <= 7;
    const isRequired = !isHelper && cell.value?.toString().includes('*');
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: isHelper   ? 'FFE8F4FD'
            : isRequired ? 'FFFFF3CD'
            :              'FFE9ECEF',
      },
    };
    cell.font = {
      bold:   !isHelper,
      italic:  isHelper,
      size:    isHelper ? 10 : 11,
      color: {
        argb: isHelper   ? 'FF1D6FA5'
            : isRequired ? 'FF856404'
            :              'FF495057',
      },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: {
        style: 'medium',
        color: {
          argb: isHelper   ? 'FF3A7DC9'
              : isRequired ? 'FFFFC107'
              :              'FFADB5BD',
        },
      },
    };
  });
  headerRow.height = 40;

  // Example row
  const exampleRow = sheet.addRow({
    customer_name:       'Juan Pérez García',
    phone:               '987654321',
    address:             'Av. Lima 123, Int. 5',
    location_name:       'Huaycan',
    reference:           'Frente al parque central',
    service_type:        'regular',
    shipping_mode:       'solo entregar',
    date:                '2026-05-10',
    total_amount:        '',
    payment_method:      '',
    payment_destination: '',
    product_name:        'Zapatillas Nike Air Max',
    quantity:            2,
    notes:               'Entregar en horario AM',
  });

  exampleRow.eachCell((cell, colNumber) => {
    // Only color the main input/info columns, excluding helpers in 5,6,7
    const isField = colNumber <= 4 || (colNumber >= 8 && colNumber <= 17);
    if (isField) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FFF4' } };
      cell.font = { italic: true, color: { argb: 'FF2D6A4F' }, size: 10 };
    }
  });

  // Data validations + VLOOKUP formulas (rows 2 → MAX_DATA_ROWS)
  for (let r = 2; r <= MAX_DATA_ROWS; r++) {
    // Dropdown: Tipo de Servicio (col I)
    sheet.getCell(`I${r}`).dataValidation = {
      type: 'list', allowBlank: false,
      formulae: ['"regular,cambio"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite: regular o cambio',
    };

    // ── Payment Blocking ──

    // Custom Validation: Monto COD (col L) only allowed if J = contraentrega
    sheet.getCell(`L${r}`).dataValidation = {
      type: 'custom',
      allowBlank: true,
      formulae: [`J${r}="contraentrega"`],
      showErrorMessage: true,
      errorTitle: 'Campo Bloqueado',
      error: 'El monto solo se puede ingresar si el modo es "contraentrega"',
    };

    // Dropdown: Modo de Entrega (col J)
    sheet.getCell(`J${r}`).dataValidation = {
      type: 'list', allowBlank: false,
      formulae: ['"solo entregar,contraentrega"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite: solo entregar o contraentrega',
    };

    // Dropdown: Método de Pago (col M)
    sheet.getCell(`M${r}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"Efectivo,Tarjeta,Transferencia,Yape,Plin"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permiten métodos de pago válidos',
    };

    // Dropdown: Forma de Pago / Abono (col N)
    sheet.getCell(`N${r}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"Abono a Japi,Abono a vendedor"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permiten formas de pago válidas',
    };

    // VLOOKUP helpers — only if catalog was available at generation time
    if (catalog) {
      // Resolve Region (E) from D (Name)
      sheet.getCell(`E${r}`).value = {
        formula: `IF(D${r}="","",IFERROR(INDEX('Catálogo'!$B:$B, MATCH(D${r},'Catálogo'!$F:$F,0)), IFERROR(INDEX('Catálogo'!$B:$B, MATCH(D${r},'Catálogo'!$D:$D,0)), "❌ No encontrado")))`,
      };
      // Resolve District (F) from D (Name)
      sheet.getCell(`F${r}`).value = {
        formula: `IF(D${r}="","",IFERROR(INDEX('Catálogo'!$D:$D, MATCH(D${r},'Catálogo'!$F:$F,0)), IFERROR(INDEX('Catálogo'!$D:$D, MATCH(D${r},'Catálogo'!$D:$D,0)), "❌ No encontrado")))`,
      };
      // Resolve Sector (G) from D (Name)
      sheet.getCell(`G${r}`).value = {
        formula: `IF(D${r}="","",IFERROR(INDEX('Catálogo'!$F:$F, MATCH(D${r},'Catálogo'!$F:$F,0)), "-"))`,
      };
    }
  }

  // ── Conditional Formatting: Grey out L, M, N if mode is "solo entregar" (J) ──
  sheet.addConditionalFormatting({
    ref: `L2:N${MAX_DATA_ROWS}`,
    rules: [
      {
        priority: 1,
        type: 'expression',
        formulae: [`$J2="solo entregar"`],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FFE5E7EB' }, // Light gray
            fgColor: { argb: 'FFE5E7EB' },
          },
          font: { color: { argb: 'FF9CA3AF' } } // Gray text
        }
      }
    ]
  });

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Sheet 2: Catálogo (lookup tables) ─────────────────────────────────────
  if (catalog) {
    const catSheet = workbook.addWorksheet('Catálogo');

    // Flatten catalog into a unified list
    const flatRows: any[] = [];
    catalog.forEach(reg => {
      reg.districts.forEach(dist => {
        if (dist.sectors.length > 0) {
          dist.sectors.forEach(sec => {
            flatRows.push({
              regId: reg.id_region,
              regName: reg.region_name,
              distId: dist.id_district,
              distName: dist.district_name,
              secId: sec.id_sector,
              secName: sec.sector_name,
            });
          });
        } else {
          // If a district has no sectors, still show the district
          flatRows.push({
            regId: reg.id_region,
            regName: reg.region_name,
            distId: dist.id_district,
            distName: dist.district_name,
            secId: null,
            secName: null,
          });
        }
      });
    });

    // ── Intro row ──
    const intro = catSheet.getCell('A1');
    intro.value = '📋 Catálogo de Ubicaciones Unificado — Usa Ctrl+F para buscar. Cada fila muestra la jerarquía completa.';
    intro.font = { italic: true, size: 9, color: { argb: 'FF555555' } };
    catSheet.mergeCells('A1:F1');
    catSheet.getRow(1).height = 20;

    const HEADER_ROW = 2;

    // ── Unified Header ──
    const headers = [
      { col: 'A', val: 'ID Región', bg: 'FF1D4ED8' },
      { col: 'B', val: 'Nombre Región', bg: 'FF1D4ED8' },
      { col: 'C', val: 'ID Distrito', bg: 'FF7C3AED' },
      { col: 'D', val: 'Nombre Distrito', bg: 'FF7C3AED' },
      { col: 'E', val: 'ID Sector', bg: 'FF059669' },
      { col: 'G', val: 'Nombre Sector', bg: 'FF059669' }, // Wait, should be F but I'll use F
    ];
    
    // Re-check column assignments: A,B,C,D,E,F
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    const names = ['ID Región', 'Nombre Región', 'ID Distrito', 'Nombre Distrito', 'ID Sector', 'Nombre Sector'];
    const colors = ['FF1D4ED8', 'FF1D4ED8', 'FF7C3AED', 'FF7C3AED', 'FF059669', 'FF059669'];

    cols.forEach((col, i) => {
      const cell = catSheet.getCell(`${col}${HEADER_ROW}`);
      cell.value = names[i];
      styleCatHeader(cell, colors[i]);
    });

    // ── Data Rows ──
    flatRows.forEach((item, i) => {
      const row = HEADER_ROW + 1 + i;
      const data = [item.regId, item.regName, item.distId, item.distName, item.secId, item.secName];
      
      cols.forEach((col, j) => {
        const cell = catSheet.getCell(`${col}${row}`);
        cell.value = data[j];
        // Alternate colors based on District for better visibility?
        // Let's use simple parity and the fill color assigned to the column type
        const lightBgMapping = ['FFDBEAFE', 'FFDBEAFE', 'FFEDE9FE', 'FFEDE9FE', 'FFD1FAE5', 'FFD1FAE5'];
        styleCatDataCell(cell, i, lightBgMapping[j]);
        if (j === 0 || j === 2 || j === 4) {
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    // Column widths
    catSheet.getColumn('A').width = 12;
    catSheet.getColumn('B').width = 24;
    catSheet.getColumn('C').width = 12;
    catSheet.getColumn('D').width = 24;
    catSheet.getColumn('E').width = 12;
    catSheet.getColumn('F').width = 24;

    // Freeze header row
    catSheet.views = [{ state: 'frozen', ySplit: HEADER_ROW }];

    // Protect the catalog sheet (readable but not editable)
    catSheet.protect('', { selectLockedCells: true, selectUnlockedCells: false });
  }

  // ── Sheet 3: _meta (very hidden — version token) ──────────────────────────
  const metaSheet = workbook.addWorksheet('_meta');
  metaSheet.state = 'veryHidden';
  metaSheet.getCell('A1').value = CURRENT_TEMPLATE_VERSION;
  metaSheet.getCell('A2').value = 'Japi Express Bulk Shipment Template';
  metaSheet.getCell('A3').value = new Date().toISOString();

  // ── Generate & download ────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plantilla_envios_japi_${TEMPLATE_VERSION_LABEL}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
