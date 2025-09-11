
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Componentes
import ProductsFilter from '@/components/filters/ProductsFilter';
import ProductsTable from '@/components/tables/ProductsTable';
// import WorkerModal from '@/components/forms/modals/WorkerModal';
// import { ConfirmModal } from '@/components/ui/confirm-modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Pagination } from '@/components/ui/pagination';
// Hooks personalizados
import { useApi } from '@/hooks';


// Tipos
export interface Product {
  id: number;
  company_name: string;
  product_name: string;
  price: number;
  current_stock: number;
  last_movement: number;
}


// --- Constantes ---
const ITEMS_PER_PAGE = 10;
const filterFields = [
  { value: '', label: '-- Seleccionar --' },
  { value: 'company_name', label: 'Nombre' },
  { value: 'product_name', label: 'Descripción' }
];


export default function WarehousePage() {
  // --- State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Hooks ---
  const { get, error: apiError } = useApi<Product[]>();

  // --- Effects ---
  // Resetear paginación al cambiar filtro o valor
  useEffect(() => {
    setCurrentPage(1);
  }, [field, value]);

  // Fetch productos
  const fetchProducts = useCallback(async () => {
    const response = await get('/kardex');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setProducts(data);
    } else {
      setProducts([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, [fetchProducts]);

  // Mostrar error de carga de API si ocurre
  const showApiError = !loading && apiError && products.length === 0;

  // --- Derived Data ---
  const filtered = useMemo(() => {
    if (!field) return products;
    const val = value.toLowerCase();
    return products.filter((product) => {
      const fieldValue = product[field as keyof Product];
      return fieldValue ? fieldValue.toString().toLowerCase().includes(val) : false;
    });
  }, [products, field, value]);

  const totalItems = filtered.length;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Handlers ---
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Empresa', key: 'company_name', width: 25 },
      { header: 'Producto', key: 'product_name', width: 30 },
      { header: 'Precio', key: 'price', width: 15 },
      { header: 'Stock', key: 'current_stock', width: 10 },
      { header: 'Último movimiento', key: 'last_movement', width: 20 },
    ];

    filtered.forEach((product) => {
      worksheet.addRow(product);
    });

    // Generar el archivo y descargarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const doc = new jsPDF();
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Empresa', dataKey: 'company_name' },
      { header: 'Producto', dataKey: 'product_name' },
      { header: 'Precio', dataKey: 'price' },
      { header: 'Stock', dataKey: 'current_stock' },
      { header: 'Último movimiento', dataKey: 'last_movement' },
    ];
    const rows = filtered.map(product => ({
      id: product.id,
      company_name: product.company_name,
      product_name: product.product_name,
      price: product.price,
      current_stock: product.current_stock,
      last_movement: product.last_movement,
    }));
    autoTable(doc, {
      columns,
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 220, 220] },
      margin: { top: 20 },
      didDrawPage: () => {
        doc.text('Listado de Productos', 14, 15);
      },
    });
    doc.save('productos.pdf');
  };

  // --- Render ---
  return (
    <section className="p-6 space-y-6">
      {/* Filtros y botón para añadir producto */}
      <ProductsFilter
        {...{
          field,
          setField,
          value,
          setValue,
          filterFields,
          onExportExcel: handleExportExcel,
          onExportPdf: handleExportPdf,
        }}
      />

      {/* Loader */}
      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando productos..." />
        </div>
      )}

      {/* Error de carga de API */}
      {showApiError && (
        <div className="text-center py-4 text-red-500">
          Error al cargar los productos: {apiError}
        </div>
      )}

      {/* Sin datos */}
      {!loading && !showApiError && filtered.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay productos disponibles.
        </div>
      )}

      {/* Tabla y paginación */}
      {!loading && (
        <>
          <ProductsTable
            {...{
              products: currentItems,
              currentPage,
              onEdit: () => { },
              onDelete: () => { },
            }}
          />
          <Pagination
            {...{
              currentPage,
              totalItems,
              itemsPerPage: ITEMS_PER_PAGE,
              onPageChange: handlePageChange,
            }}
          />
        </>
      )}
    </section>
  );
}
