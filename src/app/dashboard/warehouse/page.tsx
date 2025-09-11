
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  id_entradaAlmacen: number;
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
