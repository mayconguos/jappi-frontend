'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks';

import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';
import DataTableFilter from '@/components/filters/DataTableFilter';
import DispatchesTable from '@/components/tables/DispatchesTable';

import { Dispatch, ApiDispatch, mapApiDispatchToDispatch } from '@/types/dispatch';

const ITEMS_PER_PAGE = 10;
const FILTER_FIELDS = [
  { value: 'all', label: 'Todos los campos' },
  { value: 'product_name', label: 'Producto' },
  { value: 'id_company', label: 'ID Empresa' },
];

export default function DispatchesPage() {
  const { user } = useAuth();
  const { get } = useApi<any>();
  
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Filtros
  const [field, setField] = useState('all');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({
    from: todayDate,
    to: todayDate,
  });

  // Fetch inicial
  useEffect(() => {
    const fetchDispatches = async () => {
      setIsInitialLoading(true);
      try {
        const resp = await get('/shipping/dispatch');
        const data = Array.isArray(resp) ? resp : (resp as any)?.data;
        if (data && Array.isArray(data)) {
          setDispatches(data.map(mapApiDispatchToDispatch));
        }
      } catch (err) {
        console.error('Error fetching dispatches:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchDispatches();
  }, [user, get]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [field, value, dateRange]);

  // Filtrado
  const filteredDispatches = useMemo(() => {
    let filtered = dispatches;

    // Filtro por fecha
    if (dateRange.from) {
      const fDate = new Date(dateRange.from);
      fDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => {
        const dDate = new Date(d.shipping_date.split('/').reverse().join('-'));
        dDate.setHours(0, 0, 0, 0);
        return dDate >= fDate;
      });
    }
    if (dateRange.to) {
      const tDate = new Date(dateRange.to);
      tDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => {
        const dDate = new Date(d.shipping_date.split('/').reverse().join('-'));
        dDate.setHours(23, 59, 59, 999);
        return dDate <= tDate;
      });
    }

    // Filtro por texto
    if (!value) return filtered;
    
    const searchTerm = value.toLowerCase();
    return filtered.filter(d => {
      if (field === 'all') {
        return (
          d.product_name.toLowerCase().includes(searchTerm) ||
          d.id_company.toString().includes(searchTerm) ||
          d.id.toString().includes(searchTerm)
        );
      }
      const fieldValue = d[field as keyof Dispatch];
      return fieldValue ? String(fieldValue).toLowerCase().includes(searchTerm) : false;
    });
  }, [field, value, dispatches, dateRange]);

  const totalItems = filteredDispatches.length;
  const currentItems = filteredDispatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8">
      <DataTableFilter
        filterFields={FILTER_FIELDS}
        totalItems={totalItems}
        field={field}
        value={value}
        dateRange={dateRange}
        setField={setField}
        setValue={setValue}
        setDateRange={setDateRange}
        onExportExcel={() => console.log('Exporting Excel...')}
      />

      {isInitialLoading ? (
        <div className="flex justify-center items-center h-64">
          <DeliveryLoader message="Cargando información de despachos..." />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <DispatchesTable
            dispatches={currentItems}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />
          
          {totalItems > 0 && (
            <div className="flex justify-center sm:justify-end">
              <Pagination 
                currentPage={currentPage} 
                totalItems={totalItems} 
                itemsPerPage={ITEMS_PER_PAGE} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
