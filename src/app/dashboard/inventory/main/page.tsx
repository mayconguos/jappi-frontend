
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
  { value: 'company_name', label: 'Empresa' },
  { value: 'product_name', label: 'Producto' }
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
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

      <div className="space-y-6">
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
            totalItems,
          }}
        />

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando productos..." />
          </div>
        )}

        {/* Error de carga de API */}
        {showApiError && (
          <div className="p-8 rounded-xl border border-red-100 bg-red-50 text-center text-red-600 flex flex-col items-center gap-2">
            <p className="font-medium">Error al cargar los productos: {apiError}</p>
          </div>
        )}

        {/* Sin datos */}
        {!loading && !showApiError && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p>No hay productos disponibles en este momento.</p>
          </div>
        )}

        {/* Tabla y paginación */}
        {!loading && !showApiError && filtered.length > 0 && (
          <div className="space-y-4">
            <ProductsTable
              {...{
                products: currentItems,
                currentPage,
                onEdit: () => { },
                onDelete: () => { },
              }}
            />
            <div className="w-full pt-4">
              <Pagination
                {...{
                  currentPage,
                  totalItems,
                  itemsPerPage: ITEMS_PER_PAGE,
                  onPageChange: handlePageChange,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
