'use client';

import { useState, useEffect, useMemo } from 'react';
import ExcelJS from 'exceljs';

import { BadgeDollarSign, Info, Eye } from 'lucide-react';

import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';

import DataTableFilter from '@/components/filters/DataTableFilter';
import ShipmentsTable from '@/components/tables/ShipmentsTable';

import { Shipment, ApiShipment } from '@/types/shipment';
import { PAYMENT_METHODS, PAYMENT_FORMS } from '@/constants/formOptions';

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
    payment_method: apiShipment.payment_method,
    payment_destination: apiShipment.payment_destination,
    signed_urls: apiShipment.signed_urls || [],
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
      try {
        const idCompany = user?.id_company;
        if (idCompany) {
          let url = `/shipping/${idCompany}`;
          const queryParams = new URLSearchParams();
          if (dateRange.from) queryParams.append('start_date', dateRange.from);
          if (dateRange.to) queryParams.append('end_date', dateRange.to);
          
          if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
          }

          const resp = await get(url);
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
  }, [user, get, dateRange.from, dateRange.to]);

  useEffect(() => { setCurrentPage(1); }, [field, value, dateRange]);

  // ─── Filtered & Paginated Data ────────────────────────────────
  const filteredShipments = useMemo(() => {
    let filtered = shipments;

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

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Envíos');

    worksheet.columns = [
      { header: 'Fecha', key: 'shipment_date', width: 15 },
      { header: 'Destinatario', key: 'customer_name', width: 30 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Dirección', key: 'address', width: 40 },
      { header: 'Distrito', key: 'district', width: 20 },
      { header: 'Transportista', key: 'carrier', width: 25 },
      { header: 'Bultos', key: 'packages', width: 10 },
      { header: 'Total (S/)', key: 'total_amount', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Método de Pago', key: 'payment_method', width: 20 },
      { header: 'Destino de Pago', key: 'payment_destination', width: 20 },
    ];

    filteredShipments.forEach((shipment) => {
      worksheet.addRow({
        ...shipment,
        status: shipment.status === 'delivered' ? 'Entregado' : (shipment.status === 'pending' ? 'Pendiente' : shipment.status),
        payment_method: PAYMENT_METHODS.find(m => m.value === shipment.payment_method)?.label || shipment.payment_method || '-',
        payment_destination: PAYMENT_FORMS.find(f => f.value === shipment.payment_destination)?.label || shipment.payment_destination || '-',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `envios_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    globalThis.URL.revokeObjectURL(url);
  };

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

        {/* Total Summary - Minimalist Premium */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                <BadgeDollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Total a Cobrar</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-emerald-800">S/</span>
                  <p className="text-2xl font-black text-emerald-950 tabular-nums leading-none">
                    {viewDetails.shipment?.total_amount ? Number(viewDetails.shipment.total_amount).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Estado</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase
                ${viewDetails.shipment?.status === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'}`}
              >
                {viewDetails.shipment?.status === 'delivered' ? 'Entregado' : 'Pendiente'}
              </span>
            </div>
          </div>

          {/* Payment Details - Subtle */}
          {(viewDetails.shipment?.payment_method || viewDetails.shipment?.payment_destination) && (
            <div className="flex items-center gap-2 px-2 py-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información de pago:</span>
              <div className="flex items-center gap-1.5">
                {viewDetails.shipment?.payment_method && (
                  <span className="text-xs font-semibold text-slate-700">
                    {PAYMENT_METHODS.find(m => m.value === viewDetails.shipment?.payment_method)?.label || viewDetails.shipment.payment_method}
                  </span>
                )}
                {viewDetails.shipment?.payment_method && viewDetails.shipment?.payment_destination && (
                  <span className="text-slate-300 text-xs">•</span>
                )}
                {viewDetails.shipment?.payment_destination && (
                  <span className="text-xs font-semibold text-slate-700">
                    {PAYMENT_FORMS.find(f => f.value === viewDetails.shipment?.payment_destination)?.label || viewDetails.shipment.payment_destination}
                  </span>
                )}
              </div>
            </div>
          )}
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

        {/* Fotos de Entrega */}
        {viewDetails.shipment?.signed_urls && viewDetails.shipment.signed_urls.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-1.5">
              <Eye size={14} className="text-slate-400" />
              Fotos de Entrega
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {viewDetails.shipment.signed_urls.map((url, idx) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
                >
                  <img
                    src={url}
                    alt={`Prueba de entrega ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
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
          <div className='flex flex-col gap-6 relative'>
            {loading && !isInitialLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex justify-center items-center rounded-2xl transition-all duration-300">
                <DeliveryLoader message="Actualizando envíos..." />
              </div>
            )}
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
        title='Detalle de Envío'
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

