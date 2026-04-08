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
    { header: 'ID Región *',           key: 'id_region',           width: 12 },
    { header: 'ID Distrito *',         key: 'id_district',         width: 14 },
    { header: 'ID Sector',             key: 'id_sector',           width: 12 },
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
    // ── VLOOKUP helper columns (Q, R, S) ──
    { header: '✔ Nombre Región',   key: '_region_name',   width: 22 },
    { header: '✔ Nombre Distrito', key: '_district_name', width: 22 },
    { header: '✔ Nombre Sector',   key: '_sector_name',   width: 22 },
  ];

  // Header row styles
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const isHelper   = colNumber >= 17;
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
    id_region:           1,
    id_district:         15,
    id_sector:           3,
    reference:           'Frente al parque central',
    service_type:        'regular',
    shipping_mode:       'delivery_only',
    date:                '2026-05-10',
    total_amount:        '',
    payment_method:      '',
    payment_destination: '',
    product_name:        'Zapatillas Nike Air Max',
    quantity:            2,
    notes:               'Entregar en horario AM',
  });

  exampleRow.eachCell((cell, colNumber) => {
    if (colNumber <= 16) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FFF4' } };
      cell.font = { italic: true, color: { argb: 'FF2D6A4F' }, size: 10 };
    }
  });

  // Data validations + VLOOKUP formulas (rows 2 → MAX_DATA_ROWS)
  for (let r = 2; r <= MAX_DATA_ROWS; r++) {
    // Dropdown: Tipo de Servicio (col H)
    sheet.getCell(`H${r}`).dataValidation = {
      type: 'list', allowBlank: false,
      formulae: ['"regular,express"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite: regular o express',
    };
    // Dropdown: Modo de Entrega (col I)
    sheet.getCell(`I${r}`).dataValidation = {
      type: 'list', allowBlank: false,
      formulae: ['"delivery_only,pay_on_delivery"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite: delivery_only o pay_on_delivery',
    };

    // VLOOKUP helpers — only if catalog was available at generation time
    if (catalog) {
      sheet.getCell(`Q${r}`).value = {
        formula: `IF(D${r}="","",IFERROR(VLOOKUP(D${r},'Catálogo'!$A:$B,2,0),"❌ ID no encontrado"))`,
      };
      sheet.getCell(`R${r}`).value = {
        formula: `IF(E${r}="","",IFERROR(VLOOKUP(E${r},'Catálogo'!$D:$E,2,0),"❌ ID no encontrado"))`,
      };
      sheet.getCell(`S${r}`).value = {
        formula: `IF(F${r}="","",IFERROR(VLOOKUP(F${r},'Catálogo'!$H:$I,2,0),"❌ ID no encontrado"))`,
      };
    }
  }

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Sheet 2: Catálogo (lookup tables) ─────────────────────────────────────
  if (catalog) {
    const catSheet = workbook.addWorksheet('Catálogo');

    // Flatten catalog
    const regions = catalog.map(r => ({
      id: r.id_region, name: r.region_name,
    }));
    const districts = catalog.flatMap(r =>
      r.districts.map(d => ({
        id: d.id_district, name: d.district_name, idRegion: r.id_region,
      }))
    );
    const sectors = catalog.flatMap(r =>
      r.districts.flatMap(d =>
        d.sectors.map(s => ({
          id: s.id_sector, name: s.sector_name, idDistrict: d.id_district,
        }))
      )
    );

    // ── Intro row ──
    const intro = catSheet.getCell('A1');
    intro.value = '📋 Catálogo de Ubicaciones — Usa Ctrl+F para buscar. Las columnas Q, R, S en la hoja Envíos confirman el nombre automáticamente.';
    intro.font = { italic: true, size: 9, color: { argb: 'FF555555' } };
    catSheet.mergeCells('A1:J1');
    catSheet.getRow(1).height = 20;

    const HEADER_ROW = 2;

    // ── Table A–B: Regiones ──
    const rhA = catSheet.getCell(`A${HEADER_ROW}`);
    const rhB = catSheet.getCell(`B${HEADER_ROW}`);
    rhA.value = 'ID Región';  styleCatHeader(rhA, 'FF1D4ED8');
    rhB.value = 'Nombre Región'; styleCatHeader(rhB, 'FF1D4ED8');

    regions.forEach((reg, i) => {
      const row = HEADER_ROW + 1 + i;
      const cellA = catSheet.getCell(`A${row}`);
      const cellB = catSheet.getCell(`B${row}`);
      cellA.value = reg.id;   styleCatDataCell(cellA, i, 'FFDBEAFE');
      cellB.value = reg.name; styleCatDataCell(cellB, i, 'FFDBEAFE');
      cellA.alignment = { horizontal: 'center' };
    });

    // ── Table D–F: Distritos ──
    const dhD = catSheet.getCell(`D${HEADER_ROW}`);
    const dhE = catSheet.getCell(`E${HEADER_ROW}`);
    const dhF = catSheet.getCell(`F${HEADER_ROW}`);
    dhD.value = 'ID Distrito';    styleCatHeader(dhD, 'FF7C3AED');
    dhE.value = 'Nombre Distrito'; styleCatHeader(dhE, 'FF7C3AED');
    dhF.value = 'ID Región';      styleCatHeader(dhF, 'FF7C3AED');

    districts.forEach((dist, i) => {
      const row = HEADER_ROW + 1 + i;
      const cellD = catSheet.getCell(`D${row}`);
      const cellE = catSheet.getCell(`E${row}`);
      const cellF = catSheet.getCell(`F${row}`);
      cellD.value = dist.id;       styleCatDataCell(cellD, i, 'FFEDE9FE');
      cellE.value = dist.name;     styleCatDataCell(cellE, i, 'FFEDE9FE');
      cellF.value = dist.idRegion; styleCatDataCell(cellF, i, 'FFEDE9FE');
      cellD.alignment = { horizontal: 'center' };
      cellF.alignment = { horizontal: 'center' };
    });

    // ── Table H–J: Sectores ──
    const shH = catSheet.getCell(`H${HEADER_ROW}`);
    const shI = catSheet.getCell(`I${HEADER_ROW}`);
    const shJ = catSheet.getCell(`J${HEADER_ROW}`);
    shH.value = 'ID Sector';    styleCatHeader(shH, 'FF059669');
    shI.value = 'Nombre Sector'; styleCatHeader(shI, 'FF059669');
    shJ.value = 'ID Distrito';   styleCatHeader(shJ, 'FF059669');

    sectors.forEach((sec, i) => {
      const row = HEADER_ROW + 1 + i;
      const cellH = catSheet.getCell(`H${row}`);
      const cellI = catSheet.getCell(`I${row}`);
      const cellJ = catSheet.getCell(`J${row}`);
      cellH.value = sec.id;          styleCatDataCell(cellH, i, 'FFD1FAE5');
      cellI.value = sec.name;        styleCatDataCell(cellI, i, 'FFD1FAE5');
      cellJ.value = sec.idDistrict;  styleCatDataCell(cellJ, i, 'FFD1FAE5');
      cellH.alignment = { horizontal: 'center' };
      cellJ.alignment = { horizontal: 'center' };
    });

    // Column widths
    catSheet.getColumn('A').width = 12;
    catSheet.getColumn('B').width = 26;
    catSheet.getColumn('C').width = 4;  // spacer
    catSheet.getColumn('D').width = 13;
    catSheet.getColumn('E').width = 28;
    catSheet.getColumn('F').width = 12;
    catSheet.getColumn('G').width = 4;  // spacer
    catSheet.getColumn('H').width = 12;
    catSheet.getColumn('I').width = 28;
    catSheet.getColumn('J').width = 13;

    // Freeze header row
    catSheet.views = [{ state: 'frozen', ySplit: HEADER_ROW }];

    // Protect the catalog sheet (readable but not editable)
    catSheet.protect('', { selectLockedCells: true, selectUnlockedCells: false });
  }

  // ── Sheet 3: _meta (very hidden — version token) ──────────────────────────
  const metaSheet = workbook.addWorksheet('_meta');
  metaSheet.state = 'veryHidden';
  metaSheet.getCell('A1').value = CURRENT_TEMPLATE_VERSION; // numeric version for range checks
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
