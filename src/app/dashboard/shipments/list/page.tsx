'use client';

import { useState, useEffect, useMemo } from 'react';

import { BadgeDollarSign, Info } from 'lucide-react';

import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';

import DataTableFilter from '@/components/filters/DataTableFilter';
import ShipmentsTable from '@/components/tables/ShipmentsTable';

import { Shipment, ApiShipment } from '@/types/shipment';

const mapApiShipmentToShipment = (apiShipment: ApiShipment): Shipment => {
  const date = apiShipment.shipping_date ? new Date(apiShipment.shipping_date) : new Date();
  const dateStr = Number.isNaN(date.getTime())
    ? 'Fecha inválida'
    : date.toISOString().split('T')[0].split('-').reverse().join('/')

  return {
    id: apiShipment.id,
    id_driver: apiShipment.id_driver || null,
    address: apiShipment.address,
    carrier: apiShipment.driver_name || 'Sin asignar',
    district: apiShipment.district_name,
    observation: undefined,
    origin: apiShipment.shipping_mode === 'supply' ? 'warehouse' : 'pickup',
    shipment_mode: apiShipment.shipping_mode,
    packages: apiShipment.package_count || 0,
    shipment_date: dateStr,
    seller: apiShipment.company_name,
    status: apiShipment.status,
    customer_name: apiShipment.customer_name,
    phone: apiShipment.phone,
    total_amount: apiShipment.total_amount,
  };
};

// ─── Data estática ─────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;
const FILTER_FIELDS = [
  { value: 'all', label: 'Todos los campos' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'carrier', label: 'Transportista' },
  { value: 'district', label: 'Distrito' },
];

export default function ListShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [field, setField] = useState('all');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima', });
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({
    from: todayDate,
    to: todayDate
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [viewDetails, setViewDetails] = useState<{
    isOpen: boolean;
    shipment: Shipment | null;
    items: { id: number; product_name: string; quantity: number }[];
    loading: boolean;
    error: string | null;
  }>({ isOpen: false, shipment: null, items: [], loading: false, error: null });

  const { get, loading } = useApi<Shipment[]>();

  // ─── Initial Fetch ────────────────────────────────────────────
  useEffect(() => {
    const fetchShipments = async () => {
      setIsInitialLoading(true);
      try {
        const idCompany = user?.id_company;
        if (idCompany) {
          const resp = await get(`/shipping/${idCompany}`);
          const data = Array.isArray(resp) ? resp : (resp as any)?.data;
          if (data && Array.isArray(data)) {
            const mapped = data.map(mapApiShipmentToShipment);
            setShipments(mapped);
          } else {
            console.warn('API Response is not an array or does not contain a "data" array:', resp);
          }
        }
      } catch (error) {
        console.error('Error fetching shipments:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    if (user) { fetchShipments(); }
  }, [user, get]);

  useEffect(() => { setCurrentPage(1); }, [field, value, dateRange]);

  // ─── Filtered & Paginated Data ────────────────────────────────
  const filteredShipments = useMemo(() => {
    let filtered = shipments;
    if (dateRange.from) {
      const fDate = new Date(dateRange.from);
      fDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => {
        const sDate = new Date(s.shipment_date.split('/').reverse().join('-')); // DD/MM/YYYY to YYYY-MM-DD
        sDate.setHours(0, 0, 0, 0);
        return sDate >= fDate;
      });
    }

    if (dateRange.to) {
      const tDate = new Date(dateRange.to);
      tDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => {
        const sDate = new Date(s.shipment_date.split('/').reverse().join('-'));
        sDate.setHours(23, 59, 59, 999);
        return sDate <= tDate;
      });
    }

    if (!value) return filtered;

    const searchTerm = value.toLowerCase();
    return filtered.filter((s) => {
      if (field === 'all') {
        return (
          s.seller.toLowerCase().includes(searchTerm) ||
          s.carrier.toLowerCase().includes(searchTerm) ||
          s.district.toLowerCase().includes(searchTerm)
        );
      }

      const fieldValue = s[field as keyof Shipment];
      return fieldValue
        ? String(fieldValue).toLowerCase().includes(searchTerm)
        : false;
    });
  }, [field, value, shipments, dateRange]);

  const totalItems = filteredShipments.length;
  const currentItems = filteredShipments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────
  const handleViewShipment = async (shipment: Shipment) => {
    setViewDetails({ isOpen: true, shipment, items: [], loading: true, error: null });
    try {
      const resp = await get(`/shipping/detail/${shipment.id}`);
      const items = Array.isArray(resp) ? resp : ((resp as any)?.data || []);
      setViewDetails(prev => ({ ...prev, loading: false, items }));
    } catch (err: any) {
      setViewDetails(prev => ({ ...prev, loading: false, error: err.message || 'Error al cargar los detalles' }));
    }
  };

  const handleExportExcel = () => console.log('Exporting Excel...');

  const renderModalContent = () => {
    if (viewDetails.loading) {
      return (
        <div className="h-40 flex items-center justify-center">
          <DeliveryLoader message="Cargando detalles..." />
        </div>
      );
    }

    if (viewDetails.error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-red-500">
          <Info size={32} className="mb-3" />
          <p className="font-medium text-red-800">{viewDetails.error}</p>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-300 space-y-5">
        {/* Info Grid - Minimalist Style like /all */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="col-span-2 sm:col-span-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-200/60 pb-1">Destinatario</span>
            <span className="font-semibold text-slate-900 block mt-1">{viewDetails.shipment?.customer_name}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-200/60 pb-1">Teléfono</span>
            <span className="font-medium text-slate-700 block mt-1">{viewDetails.shipment?.phone}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-200/60 pb-1">Dirección de Entrega</span>
            <span className="font-medium text-slate-600 block mt-1 leading-relaxed">
              {viewDetails.shipment?.address}
              {viewDetails.shipment?.district && (
                <span className="text-slate-400 font-normal ml-1">({viewDetails.shipment.district})</span>
              )}
            </span>
          </div>
        </div>

        {/* Productos Section */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Productos a Enviar</h4>
          {viewDetails.items.length > 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3 border-b border-slate-100">Producto</th>
                    <th className="px-5 py-3 border-b border-slate-100 text-center w-24">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {viewDetails.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-700 break-words">{item.product_name}</td>
                      <td className="px-5 py-3.5 text-center text-slate-900 font-bold bg-slate-50/20">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No se encontraron productos asociados.
            </p>
          )}
        </div>

        {/* Total Summary - Simplified & Premium */}
        <div className="flex items-center justify-between p-5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <BadgeDollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Total a Cobrar</p>
              <p className="text-2xl font-black text-emerald-900 tabular-nums">
                S/ {viewDetails.shipment?.total_amount ? Number(viewDetails.shipment.total_amount).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {viewDetails.shipment?.status === 'delivered' ? 'Entregado' : 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Observations */}
        {viewDetails.shipment?.observation && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Info size={12} className="text-slate-400" />
              Observaciones
            </p>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{viewDetails.shipment.observation}"
            </p>
          </div>
        )}
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8">
      <div className="space-y-6">
        {/* Filters */}
        <DataTableFilter
          filterFields={FILTER_FIELDS}
          totalItems={totalItems}
          field={field}
          value={value}
          dateRange={dateRange}
          setField={setField}
          setValue={setValue}
          setDateRange={setDateRange}
          onExportExcel={handleExportExcel}
        />

        {isInitialLoading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando información de envíos..." />
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            <ShipmentsTable
              mode="company"
              shipments={currentItems}
              currentPage={currentPage}
              onView={handleViewShipment}
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

      {/* View Detail Modal (specific to shipments) */}
      <Modal
        isOpen={viewDetails.isOpen}
        onClose={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}
        size="md"
        title={`Detalle de Envío #${viewDetails.shipment?.id.toString().padStart(5, '0')}`}
        footer={
          <ModalFooter>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}>
                Cerrar
              </Button>
            </div>
          </ModalFooter>
        }
      >
        <div className="py-2 space-y-6">
          {renderModalContent()}
        </div>
      </Modal>
    </div>
  );
}

