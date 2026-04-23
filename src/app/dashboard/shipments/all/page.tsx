'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

import { Loader2, Package, MapPin, Phone, Calendar, BadgeDollarSign, Info } from 'lucide-react';

import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import DeliveryLoader from '@/components/ui/delivery-loader';

import ShipmentsFilter from '@/components/filters/ShipmentsFilter';
import ShipmentsTable from '@/components/tables/ShipmentsTable';

// ─── Constantes ───────────────────────────────────────────────
const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  picked_up: 'Recogido',
  received: 'Recibido',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  returned: 'Devuelto',
};

export type ShipmentStatus = 'pending' | 'scheduled' | 'picked_up' | 'received' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';

export interface Shipment {
  id: number;
  id_driver: number | null;
  address: string;
  carrier: string;
  district: string;
  observation?: string;
  origin: 'pickup' | 'warehouse';
  shipment_mode: string;
  packages: number;
  shipment_date: string;
  seller: string;
  status: string;
  customer_name: string;
  phone: string;
}

export interface ApiShipment {
  id: number,
  id_driver: number | null,
  address: string
  company_name: string; // seller
  district_name: string,
  driver_name: string | null;
  customer_name: string,
  total_amount: number,
  delivery_amount: number,
  package_count?: number,
  shipping_mode: string,
  phone: string,
  shipping_date: string,
  status: string,
}

export interface Courier {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  document_type: string;
  document_number: string;
  status: number;
  vehicle_type: string;
  license: string;
  plate_number: string;
  brand: string;
}

const mapApiShipmentToShipment = (apiShipment: ApiShipment): Shipment => {
  const date = apiShipment.shipping_date ? new Date(apiShipment.shipping_date) : new Date();
  const dateStr = !isNaN(date.getTime())
    ? date.toISOString().split('T')[0].split('-').reverse().join('/')
    : 'Fecha inválida';

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

export default function AllShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const { user } = useAuth();
  const [field, setField] = useState('all');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // Default to today for both from and to
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({
    from: todayDate,
    to: todayDate
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- Carrier Flow State ---
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isFetchingCouriers, setIsFetchingCouriers] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);
  const [isUpdatingCarrier, setIsUpdatingCarrier] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedChange, setSelectedChange] = useState<{ shipmentId: number; courierId: number; courierName: string } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ shipmentId: number; status: ShipmentStatus } | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<{ title: string; message: string } | null>(null);

  // --- Multi-select State ---
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchStatusModalOpen, setIsBatchStatusModalOpen] = useState(false);
  const [batchCarrier, setBatchCarrier] = useState<string>('');
  const [batchStatus, setBatchStatus] = useState<ShipmentStatus | ''>('');

  // --- View Shipment State ---
  const [viewDetails, setViewDetails] = useState<{
    isOpen: boolean;
    shipment: Shipment | null;
    items: { id: number, product_name: string; quantity: number }[];
    loading: boolean;
    error: string | null;
  }>({ isOpen: false, shipment: null, items: [], loading: false, error: null });

  // --- Cancel Shipment State ---
  const [shipmentToCancel, setShipmentToCancel] = useState<number | null>(null);

  const { get, put } = useApi<any>();

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchShipments = async () => {
      setIsInitialLoading(true);
      try {
        console.log('Fetching shipments from /shipping...');
        const resp = await get(`/shipping`);
        console.log('Shipments API Response:', resp);

        const data = Array.isArray(resp) ? resp : (resp as any)?.data;

        if (data && Array.isArray(data)) {
          console.log(`Mapping ${data.length} shipments...`);
          const mapped = data.map(mapApiShipmentToShipment);
          setShipments(mapped);
        } else {
          console.warn('API Response is not an array or does not contain a "data" array:', resp);
        }
      } catch (error) {
        console.error('Error fetching shipments:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchShipments();
  }, [user, get]);

  const fetchCouriers = useCallback(async () => {
    if (couriers.length > 0 || isFetchingCouriers) return;
    setIsFetchingCouriers(true);
    try {
      const resp = await get('/user?type=couriers');
      if (resp && Array.isArray(resp)) {
        setCouriers(resp);
      }
    } catch (err) {
      console.error('Error fetching couriers', err);
    } finally {
      setIsFetchingCouriers(false);
    }
  }, [get, couriers.length, isFetchingCouriers]);


  // --- Reset page on filter change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [field, value, dateRange]);

  const filteredShipments = useMemo(() => {
    let filtered = shipments;

    // Filter by Date Range
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
  const currentItems = filteredShipments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExportExcel = () => console.log('Exporting Excel...');

  const handleStatusChange = (id: number, status: ShipmentStatus) => {
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) return;

    // // Bloqueo estricto: Si ya está en Recibido, no se puede cambiar a ningún otro estado
    // if (shipment.status === 'received') {
    //   setWarningModal({
    //     title: 'Acción Bloqueada',
    //     message: 'No se puede modificar un recojo que ya ha sido Recibido.'
    //   });
    //   return;
    // }

    // if ((status === 'scheduled' || status === 'received') && (shipment.carrier === 'Sin asignar' || !pickup.carrier)) {
    //   setWarningModal({
    //     title: 'Asignación Requerida',
    //     message: 'No se puede cambiar el estado a Programado o Recibido sin asignar un transportista previo.'
    //   });
    //   return;
    // }

    // if (status === 'received' && pickup.status !== 'picked_up') {
    //   setWarningModal({
    //     title: 'Recojo Pendiente',
    //     message: 'No se puede marcar como Recibido hasta que el transportista haya marcado el recojo como Recogido.'
    //   });
    //   return;
    // }

    setPendingStatusChange({ shipmentId: id, status });
    setIsConfirmStatusModalOpen(true);
  };

  const handleCarrierSelect = (id: number, driverIdStr: string) => {
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) return;

    if (shipment.status === 'received') {
      setWarningModal({
        title: 'Acción Bloqueada',
        message: 'No se puede modificar el transportista de un envio ya Enviado.'
      });
      return;
    }

    // if (driverIdStr === '0' && shipment.status === 'scheduled') {
    //   setWarningModal({
    //     title: 'Transportista Obligatorio',
    //     message: 'No se puede desasignar el transportista si el estado actual es Programado.'
    //   });
    //   return;
    // }

    // const currentDriverStr = pickup.id_driver?.toString() || '0';
    // if (driverIdStr === currentDriverStr) return;

    // const courier = couriers.find(c => c.id.toString() === driverIdStr);
    // const courierName = courier ? `${courier.first_name} ${courier.last_name || ''}`.trim() : 'Sin asignar';

    // setSelectedChange({ pickupId: id, courierId: parseInt(driverIdStr), courierName });
    setIsConfirmModalOpen(true);
  };

  const handleCancel = (id: number) => {
    setShipmentToCancel(id);
  };


  // --- Multi-select Handlers ---
  const handleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: number[]) => {
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8">
      <ShipmentsFilter
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
        <div className="flex flex-col gap-6">
          <ShipmentsTable
            shipments={currentItems}
            currentPage={currentPage}
            selectedIds={selectedIds}
            onSelectOne={handleSelectOne}
            onSelectAll={handleSelectAll}
            onView={(shipment) => console.log(shipment)}
            onStatusChange={handleStatusChange}
            onCarrierChange={handleCarrierSelect}
            onCancel={handleCancel}
            couriers={couriers}
            isFetchingCouriers={isFetchingCouriers}
            onFetchCouriers={fetchCouriers}
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

      {/* View detail Modal */}
      <Modal
        isOpen={viewDetails.isOpen}
        onClose={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}
        size="md"
        title={`Detalle de Envío #${viewDetails.shipment?.id}`}
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
          {viewDetails.loading ? (
            <div className="flex flex-col gap-6">

              {/* Primera Fila: Cliente & Producto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Información del Cliente
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold">Cliente</p>
                        {/* <p className="font-semibold text-gray-900 text-sm leading-tight">{selectedShipment.customer_name}</p> */}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold">Teléfono</p>
                        {/* <p className="font-semibold text-gray-900 text-sm">{selectedShipment.phone}</p> */}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold">Dirección de Entrega</p>
                        {/* <p className="font-medium text-gray-700 text-sm leading-snug">{selectedShipment.address}</p> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Detail Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Detalles del Pedido
                  </h4>
                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold mb-2">Producto(s)</p>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="text-sm font-medium text-gray-800 leading-relaxed italic">
                          {/* "{selectedShipment.product_name}" */}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide font-bold mb-1">Fecha Programada</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <p className="font-bold text-slate-700 text-sm">
                            {/* {selectedShipment.shipping_date ? selectedShipment.shipping_date.split('T')[0].split('-').reverse().join('/') : ''} */}
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide font-bold mb-1">Costo Envío</p>
                        <div className="flex items-center gap-2">
                          <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          {/* <p className="font-bold text-emerald-700 text-sm">S/ {Number(selectedShipment.delivery_amount).toFixed(2)}</p> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segunda Fila: Monto Total & Observación */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <BadgeDollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-[11px] uppercase tracking-widest font-bold">Total a Cobrar</p>
                      {/* <p className="text-3xl font-black tabular-nums">S/ {Number(selectedShipment.total_amount).toFixed(2)}</p> */}
                    </div>
                  </div>

                  <div className="h-px w-full md:h-12 md:w-px bg-white/20"></div>

                  <div className="flex-1 w-full">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <div className="w-full">
                        <p className="text-white/70 text-[11px] uppercase tracking-widest font-bold mb-1">Observaciones</p>
                        <p className="text-sm font-medium leading-normal line-clamp-2">
                          {/* {selectedShipment.observation || 'Sin observaciones adicionales para este envío.'} */}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (<div></div>)}
        </div>
      </Modal>
    </div>
  );
}
