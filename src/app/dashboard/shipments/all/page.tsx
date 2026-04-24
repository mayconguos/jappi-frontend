'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

import { AlertTriangle, BadgeDollarSign, Calendar, CheckCircle, Info, Loader2, MapPin, Package, Phone, RefreshCw, Truck } from 'lucide-react';

import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import DeliveryLoader from '@/components/ui/delivery-loader';

import DataTableFilter from '@/components/filters/DataTableFilter';
import ShipmentsTable from '@/components/tables/ShipmentsTable';

import { Shipment, ApiShipment, ShipmentStatus } from '@/types/shipment';
import { Courier } from '@/types/courier';

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

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusChange) return;
    setIsUpdatingStatus(true);

    // Simular golpe a API
    await new Promise(resolve => setTimeout(resolve, 1500));

    setShipments(prev => prev.map(s =>
      s.id === pendingStatusChange.shipmentId ? { ...s, status: pendingStatusChange.status } : s
    ));

    setIsUpdatingStatus(false);
    setIsConfirmStatusModalOpen(false);
    setPendingStatusChange(null);
    setSuccessModal('El estado del recojo ha sido actualizado correctamente.');
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

  const handleConfirmCarrierUpdate = async () => {
    if (!selectedChange) return;
    setIsUpdatingCarrier(true);

    const driverId = selectedChange.courierId;

    try {
      const payload = {
        assignments: [
          {
            id_shipment: selectedChange.shipmentId,
            id_driver: driverId
          }
        ]
      };

      const response = await put('/shipment/assign', payload);
      if (!response) {
        throw new Error('Hubo un error comunicándose con el servidor.');
      }

      const isUnassigning = driverId === 0;

      setShipments(prev => prev.map(s =>
        s.id === selectedChange.shipmentId
          ? {
            ...s,
            carrier: selectedChange.courierName,
            id_driver: driverId === 0 ? null : driverId,
            status: !isUnassigning ? 'scheduled' : s.status
          }
          : s
      ));

      setSuccessModal('El transportista ha sido asignado correctamente.');
    } catch (err: any) {
      setWarningModal({
        title: 'Error de Asignación',
        message: err.message || 'Ocurrió un error al intentar asignar el transportista.'
      });
    } finally {
      setIsUpdatingCarrier(false);
      setIsConfirmModalOpen(false);
      setSelectedChange(null);
    }
  };

  const handleCancel = (id: number) => {
    setShipmentToCancel(id);
  };

  const confirmCancel = () => {
    if (shipmentToCancel !== null) {
      setShipments(prev => prev.filter(s => s.id !== shipmentToCancel));
      setShipmentToCancel(null);
      setSuccessModal('El envio ha sido cancelado exitosamente.');
    }
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

  const handleBatchCarrierUpdate = async () => {
    if (!batchCarrier || selectedIds.length === 0) return;
    setIsUpdatingCarrier(true);

    const driverId = parseInt(batchCarrier);
    const courier = couriers.find(c => c.id === driverId);
    const courierName = courier ? `${courier.first_name} ${courier.last_name || ''}`.trim() : 'Sin asignar';

    try {
      const payload = {
        assignments: selectedIds.map(id => ({
          id_pickup: id,
          id_driver: driverId
        }))
      };

      const response = await put('/shipping/assign', payload);
      if (!response) {
        throw new Error('No se pudo completar la asignación masiva en el servidor.');
      }

      const isUnassigning = driverId === 0;

      setShipments(prev => prev.map(s =>
        selectedIds.includes(s.id)
          ? {
            ...s,
            carrier: courierName,
            id_driver: driverId === 0 ? null : driverId,
            status: !isUnassigning ? 'scheduled' : s.status
          }
          : s
      ));

      setSuccessModal(`Se ha asignado correctamente a ${courierName} para los ${selectedIds.length} envíos seleccionados.`);
    } catch (err: any) {
      setWarningModal({
        title: 'Error de Asignación Masiva',
        message: err.message || 'Ocurrió un error al intentar realizar la asignación masiva.'
      });
    } finally {
      setIsUpdatingCarrier(false);
      setIsBatchModalOpen(false);
      setSelectedIds([]);
      setBatchCarrier('');
    }
  };

  const handleBatchStatusUpdate = async () => {
    if (!batchStatus || selectedIds.length === 0) return;
    setIsUpdatingStatus(true);

    // Simular golpe a API para múltiples IDs
    await new Promise(resolve => setTimeout(resolve, 2000));

    setShipments(prev => prev.map(s =>
      selectedIds.includes(s.id) ? { ...s, status: batchStatus as ShipmentStatus } : s
    ));

    setIsUpdatingStatus(false);
    setIsBatchStatusModalOpen(false);
    setSelectedIds([]);
    setBatchStatus('');
    setSuccessModal(`Se ha actualizado el estado a ${STATUS_LABELS[batchStatus as ShipmentStatus]} para los ${selectedIds.length} envíos seleccionados.`);
  };

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
        onExportExcel={handleExportExcel}
      />

      {isInitialLoading ? (
        <div className="flex justify-center items-center h-64">
          <DeliveryLoader message="Cargando información de envíos..." />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <ShipmentsTable
            mode="admin"
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
        title={`Detalle del Envío #${viewDetails.shipment?.id}`}
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

      {/* Confirmation Cancel Modal */}
      <Modal
        isOpen={shipmentToCancel !== null}
        onClose={() => setShipmentToCancel(null)}
        size="sm"
        title="Cancelar Envío"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShipmentToCancel(null)}
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
            >
              Cancelar Recojo
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-slate-600 font-medium mb-1">
            ¿Estás seguro que deseas cancelar este recojo?
          </p>
          <p className="text-sm text-slate-400">Esta acción removerá el recojo de la lista permanentemente.</p>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !isUpdatingCarrier && setIsConfirmModalOpen(false)}
        size="sm"
        title="Confirmar Asignación"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isUpdatingCarrier}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#02997d] hover:bg-[#027d66] text-white"
              onClick={handleConfirmCarrierUpdate}
              disabled={isUpdatingCarrier}
            >
              Asignar
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          {isUpdatingCarrier ? (
            <DeliveryLoader message="Actualizando transportista..." />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-slate-600 font-medium mb-1">
                ¿Estás seguro que deseas asignar a <span className="font-bold text-slate-900">"{selectedChange?.courierName}"</span> para este envío?
              </p>
              <p className="text-sm text-slate-400">Esta acción actualizará la asignación del motorizado en el sistema.</p>
            </>
          )}
        </div>
      </Modal>

      {/* Confirmation Status Modal */}
      <Modal
        isOpen={isConfirmStatusModalOpen}
        onClose={() => !isUpdatingStatus && setIsConfirmStatusModalOpen(false)}
        size="sm"
        title="Confirmar Cambio de Estado"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmStatusModalOpen(false)}
              disabled={isUpdatingStatus}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#02997d] hover:bg-[#027d66] text-white"
              onClick={handleConfirmStatusUpdate}
              disabled={isUpdatingStatus}
            >
              Confirmar
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          {isUpdatingStatus ? (
            <DeliveryLoader message="Actualizando estado..." />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-slate-600 font-medium mb-1">
                ¿Estás seguro que deseas cambiar el estado a <span className="font-bold text-slate-900">"{pendingStatusChange ? STATUS_LABELS[pendingStatusChange.status] : ''}"</span>?
              </p>
              <p className="text-sm text-slate-400">Esta acción actualizará el flujo logístico del recojo.</p>
            </>
          )}
        </div>
      </Modal>

      {/* Success Modal */}
      {successModal && (
        <Modal
          isOpen={!!successModal}
          onClose={() => setSuccessModal(null)}
          size="sm"
          title="Operación Exitosa"
          footer={
            <ModalFooter className="justify-center">
              <Button onClick={() => setSuccessModal(null)} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                Aceptar
              </Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-slate-600 font-medium">
              {successModal}
            </p>
          </div>
        </Modal>
      )}

      {/* Batch Assignment Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => !isUpdatingCarrier && setIsBatchModalOpen(false)}
        size="sm"
        title="Asignación Masiva"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsBatchModalOpen(false)}
              disabled={isUpdatingCarrier}
            >
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleBatchCarrierUpdate}
              disabled={isUpdatingCarrier || !batchCarrier}
            >
              Confirmar Asignación
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <Truck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-600 font-medium">
              Asignar un transportista a los <span className="font-bold text-slate-900">{selectedIds.length}</span> envíos seleccionados.
            </p>
            <p className="text-xs text-slate-400 mt-1">Los envíos pasarán automáticamente a estado "Programado".</p>
          </div>
          <div className="w-full pt-2">
            <Select
              label="Seleccionar Transportista"
              value={batchCarrier}
              onChange={setBatchCarrier}
              options={couriers.map(c => ({
                label: `${c.first_name} ${c.last_name || ''}`.trim(),
                value: c.id.toString(),
              }))}
              placeholder="Elegir motorizado..."
              className="w-full"
            />
          </div>
        </div>
      </Modal>

      {/* Batch Status Modal */}
      <Modal
        isOpen={isBatchStatusModalOpen}
        onClose={() => !isUpdatingStatus && setIsBatchStatusModalOpen(false)}
        size="sm"
        title="Cambio de Estado Masivo"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsBatchStatusModalOpen(false)}
              disabled={isUpdatingStatus}
            >
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleBatchStatusUpdate}
              disabled={isUpdatingStatus || !batchStatus}
            >
              Confirmar cambio
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-slate-600 font-medium">
              Cambiar el estado de los <span className="font-bold text-slate-900">{selectedIds.length}</span> envíos seleccionados.
            </p>
            <p className="text-xs text-slate-400 mt-1">Este cambio afectará el flujo logístico de todos los pedidos seleccionados.</p>
          </div>
          <div className="w-full pt-2">
            <Select
              label="Nuevo Estado"
              value={batchStatus}
              onChange={(val) => setBatchStatus(val as ShipmentStatus)}
              options={Object.entries(STATUS_LABELS)
                .filter(([key]) => key !== 'picked_up') // El admin no puede marcar como recogido masivamente (es algo del motorizado)
                .map(([key, label]) => ({
                  label,
                  value: key,
                }))}
              placeholder="Elegir estado..."
              className="w-full"
            />
          </div>
        </div>
      </Modal>

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700/50 backdrop-blur-md">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-sm">
                {selectedIds.length}
              </div>
              <span className="text-sm font-medium text-slate-300">Seleccionados</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  fetchCouriers();
                  setIsBatchModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest px-5 h-10"
              >
                <Truck size={14} className="mr-2" />
                Asignar Courier
              </Button>
              <Button
                onClick={() => setIsBatchStatusModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest px-5 h-10 border border-slate-700"
              >
                <RefreshCw size={14} className="mr-2" />
                Cambiar Estado
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-widest h-10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
