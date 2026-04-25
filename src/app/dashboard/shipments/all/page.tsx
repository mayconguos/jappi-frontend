'use client';

import { useState, useMemo, useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';
import BatchActionBar from '@/components/ui/BatchActionBar';

import DataTableFilter from '@/components/filters/DataTableFilter';
import ShipmentsTable from '@/components/tables/ShipmentsTable';

import { AssignCarrierModal, ChangeStatusModal, CancelConfirmModal, BatchAssignModal, BatchStatusModal } from '@/components/modals/ActionModals';
import { SuccessModal, WarningModal } from '@/components/modals/FeedbackModals';

import { Shipment, ApiShipment, ShipmentStatus } from '@/types/shipment';
import { useTableActions } from '@/hooks/useTableActions';

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

// ─── Helper de Mapeo ───────────────────────────────────────────
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
const STATUS_OPTIONS = Object.entries(STATUS_LABELS)
  .filter(([key]) => key !== 'picked_up')
  .map(([value, label]) => ({ label, value }));

export default function AllShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [field, setField] = useState('all');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({
    from: todayDate,
    to: todayDate,
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // View details state (specific to this page)
  const [viewDetails, setViewDetails] = useState<{
    isOpen: boolean;
    shipment: Shipment | null;
    items: { id: number; product_name: string; quantity: number }[];
    loading: boolean;
    error: string | null;
  }>({ isOpen: false, shipment: null, items: [], loading: false, error: null });

  const actions = useTableActions<ShipmentStatus>();
  const {
    couriers, isFetchingCouriers, fetchCouriers,
    isConfirmModalOpen, setIsConfirmModalOpen, isUpdatingCarrier, setIsUpdatingCarrier,
    selectedChange, setSelectedChange,
    isConfirmStatusModalOpen, setIsConfirmStatusModalOpen, isUpdatingStatus, setIsUpdatingStatus,
    pendingStatusChange, setPendingStatusChange,
    selectedIds, setSelectedIds, handleSelectOne, handleSelectAll,
    isBatchModalOpen, setIsBatchModalOpen,
    isBatchStatusModalOpen, setIsBatchStatusModalOpen,
    batchCarrier, setBatchCarrier,
    batchStatus, setBatchStatus,
    successModal, setSuccessModal,
    warningModal, setWarningModal,
    entityToCancel: shipmentToCancel, setEntityToCancel: setShipmentToCancel,
    put, get,
  } = actions;

  // ─── Initial Fetch ────────────────────────────────────────────
  useEffect(() => {
    const fetchShipments = async () => {
      setIsInitialLoading(true);
      try {
        const resp = await get('/shipping');
        const data = Array.isArray(resp) ? resp : (resp as any)?.data;
        if (data && Array.isArray(data)) setShipments(data.map(mapApiShipmentToShipment));
      } catch (err) {
        console.error('Error fetching shipments:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchShipments();
  }, [user, get]);

  useEffect(() => { setCurrentPage(1); }, [field, value, dateRange]);

  // ─── Filtered & Paginated Data ────────────────────────────────
  const filteredShipments = useMemo(() => {
    let filtered = shipments;
    if (dateRange.from) {
      const fDate = new Date(dateRange.from);
      fDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => {
        const sDate = new Date(s.shipment_date.split('/').reverse().join('-'));
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
    return filtered.filter(s => {
      if (field === 'all') return s.seller.toLowerCase().includes(searchTerm) || s.carrier.toLowerCase().includes(searchTerm) || s.district.toLowerCase().includes(searchTerm);
      const fieldValue = s[field as keyof Shipment];
      return fieldValue ? String(fieldValue).toLowerCase().includes(searchTerm) : false;
    });
  }, [field, value, shipments, dateRange]);

  const totalItems = filteredShipments.length;
  const currentItems = filteredShipments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────

  const handleViewShipment = async (shipment: Shipment) => {
    setViewDetails({ isOpen: true, shipment, items: [], loading: true, error: null });
    try {
      const resp = await get(`/shipment/detail/${shipment.id}`);
      const items = Array.isArray(resp) ? resp : ((resp as any)?.data || []);
      setViewDetails(prev => ({ ...prev, loading: false, items }));
    } catch (err: any) {
      setViewDetails(prev => ({ ...prev, loading: false, error: err.message || 'Error al cargar los detalles' }));
    }
  };

  const handleStatusChange = (id: number, status: ShipmentStatus) => {
    setPendingStatusChange({ entityId: id, status });
    setIsConfirmStatusModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusChange) return;
    setIsUpdatingStatus(true);
    try {
      const response = await put('/shipping/status', [{ id_shipping: pendingStatusChange.entityId, status: pendingStatusChange.status }]);
      if (!response) throw new Error('Hubo un error comunicándose con el servidor.');
      setShipments(prev => prev.map(s => s.id === pendingStatusChange.entityId ? { ...s, status: pendingStatusChange.status } : s));
      setSuccessModal('El estado del envío ha sido actualizado correctamente.');
    } catch (err: any) {
      setWarningModal({ title: 'Error al cambiar estado', message: err.message || 'Ocurrió un error al intentar cambiar el estado.' });
    } finally {
      setIsUpdatingStatus(false);
      setIsConfirmStatusModalOpen(false);
      setPendingStatusChange(null);
    }
  };

  const handleCarrierSelect = (id: number, driverIdStr: string) => {
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) return;
    if (shipment.status === 'received') { setWarningModal({ title: 'Acción Bloqueada', message: 'No se puede modificar el transportista de un envío ya Enviado.' }); return; }
    if (driverIdStr === '0' && shipment.status === 'scheduled') { setWarningModal({ title: 'Transportista Obligatorio', message: 'No se puede desasignar el transportista si el estado actual es Programado.' }); return; }
    const currentDriverStr = shipment.id_driver?.toString() || '0';
    if (driverIdStr === currentDriverStr) return;
    const courier = couriers.find(c => c.id.toString() === driverIdStr);
    const courierName = courier ? `${courier.first_name} ${courier.last_name || ''}`.trim() : 'Sin asignar';
    setSelectedChange({ entityId: id, courierId: parseInt(driverIdStr), courierName });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCarrierUpdate = async () => {
    if (!selectedChange) return;
    setIsUpdatingCarrier(true);
    const driverId = selectedChange.courierId;
    try {
      const response = await put('/shipment/assign', { assignments: [{ id_shipment: selectedChange.entityId, id_driver: driverId }] });
      if (!response) throw new Error('Hubo un error comunicándose con el servidor.');
      const isUnassigning = driverId === 0;
      setShipments(prev => prev.map(s => s.id === selectedChange.entityId ? { ...s, carrier: selectedChange.courierName, id_driver: driverId === 0 ? null : driverId, status: !isUnassigning ? 'scheduled' : s.status } : s));
      setSuccessModal('El transportista ha sido asignado correctamente.');
    } catch (err: any) {
      setWarningModal({ title: 'Error de Asignación', message: err.message || 'Ocurrió un error al intentar asignar el transportista.' });
    } finally {
      setIsUpdatingCarrier(false);
      setIsConfirmModalOpen(false);
      setSelectedChange(null);
    }
  };

  const handleBatchCarrierUpdate = async () => {
    if (!batchCarrier || selectedIds.length === 0) return;
    setIsUpdatingCarrier(true);
    const driverId = parseInt(batchCarrier);
    const courier = couriers.find(c => c.id === driverId);
    const courierName = courier ? `${courier.first_name} ${courier.last_name || ''}`.trim() : 'Sin asignar';
    try {
      const response = await put('/shipping/assign', { assignments: selectedIds.map(id => ({ id_shipping: id, id_driver: driverId })) });
      if (!response) throw new Error('No se pudo completar la asignación masiva en el servidor.');
      const isUnassigning = driverId === 0;
      setShipments(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, carrier: courierName, id_driver: driverId === 0 ? null : driverId, status: !isUnassigning ? 'scheduled' : s.status } : s));
      setSuccessModal(`Se ha asignado correctamente a ${courierName} para los ${selectedIds.length} envíos seleccionados.`);
    } catch (err: any) {
      setWarningModal({ title: 'Error de Asignación Masiva', message: err.message || 'Ocurrió un error al intentar realizar la asignación masiva.' });
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
    try {
      const response = await put('/shipping/status', selectedIds.map(id => ({ id_shipping: id, status: batchStatus })));
      if (!response) throw new Error('No se pudo completar el cambio de estado masivo en el servidor.');
      setShipments(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: batchStatus as ShipmentStatus } : s));
      setSuccessModal(`Se ha actualizado el estado a ${STATUS_LABELS[batchStatus as ShipmentStatus]} para los ${selectedIds.length} envíos seleccionados.`);
    } catch (err: any) {
      setWarningModal({ title: 'Error de Cambio de Estado Masivo', message: err.message || 'Ocurrió un error al intentar cambiar el estado masivamente.' });
    } finally {
      setIsUpdatingStatus(false);
      setIsBatchStatusModalOpen(false);
      setSelectedIds([]);
      setBatchStatus('');
    }
  };

  const confirmCancel = () => {
    if (shipmentToCancel !== null) {
      setShipments(prev => prev.filter(s => s.id !== shipmentToCancel));
      setShipmentToCancel(null);
      setSuccessModal('El envío ha sido cancelado exitosamente.');
    }
  };

  // ─── Render ───────────────────────────────────────────────────
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
            onView={handleViewShipment}
            onStatusChange={handleStatusChange}
            onCarrierChange={handleCarrierSelect}
            onCancel={id => setShipmentToCancel(id)}
            couriers={couriers}
            isFetchingCouriers={isFetchingCouriers}
            onFetchCouriers={fetchCouriers}
          />
          {totalItems > 0 && (
            <div className="flex justify-center sm:justify-end">
              <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}

      {/* View Detail Modal (specific to shipments) */}
      <Modal
        isOpen={viewDetails.isOpen}
        onClose={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}
        size="md"
        title={`Detalle del Envío #${viewDetails.shipment?.id}`}
        footer={<ModalFooter><div className="flex justify-end pt-2"><Button onClick={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}>Cerrar</Button></div></ModalFooter>}
      >
        <div className="py-2 space-y-6">
          {viewDetails.loading ? (
            <div className="h-40 flex items-center justify-center"><DeliveryLoader message="Cargando detalles..." /></div>
          ) : viewDetails.error ? (
            <div className="flex flex-col items-center justify-center py-8 text-red-500">
              <AlertTriangle size={32} className="mb-3" />
              <p className="font-medium text-red-800">{viewDetails.error}</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Vendedor / Tienda</span>
                  <span className="font-semibold text-slate-900 block mt-1.5">{viewDetails.shipment?.seller}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Dirección de Recojo</span>
                  <span className="font-medium text-slate-700 block mt-1.5">{viewDetails.shipment?.address}</span>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Productos a Enviar</h4>
                {viewDetails.items.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="px-4 py-2 border-b border-slate-200">Producto</th>
                          <th className="px-4 py-2 border-b border-slate-200 text-center w-24">Cant.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewDetails.items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800 break-words">{item.product_name}</td>
                            <td className="px-4 py-3 text-center text-slate-900 font-bold bg-slate-50/30">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No se encontraron productos asociados al envío.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Shared Modals */}
      <CancelConfirmModal isOpen={shipmentToCancel !== null} entityLabel="Envío" onConfirm={confirmCancel} onClose={() => setShipmentToCancel(null)} />
      <AssignCarrierModal isOpen={isConfirmModalOpen} isLoading={isUpdatingCarrier} courierName={selectedChange?.courierName} entityLabel="envío" onConfirm={handleConfirmCarrierUpdate} onClose={() => setIsConfirmModalOpen(false)} />
      <ChangeStatusModal isOpen={isConfirmStatusModalOpen} isLoading={isUpdatingStatus} statusLabel={pendingStatusChange ? STATUS_LABELS[pendingStatusChange.status] : ''} onConfirm={handleConfirmStatusUpdate} onClose={() => setIsConfirmStatusModalOpen(false)} />
      <SuccessModal message={successModal} onClose={() => setSuccessModal(null)} />
      <WarningModal modal={warningModal} onClose={() => setWarningModal(null)} />
      <BatchAssignModal isOpen={isBatchModalOpen} isLoading={isUpdatingCarrier} selectedCount={selectedIds.length} entityLabelPlural="envíos" couriers={couriers} value={batchCarrier} onChange={setBatchCarrier} onConfirm={handleBatchCarrierUpdate} onClose={() => setIsBatchModalOpen(false)} />
      <BatchStatusModal isOpen={isBatchStatusModalOpen} isLoading={isUpdatingStatus} selectedCount={selectedIds.length} entityLabelPlural="envíos" statusOptions={STATUS_OPTIONS} value={batchStatus} onChange={v => setBatchStatus(v as ShipmentStatus)} onConfirm={handleBatchStatusUpdate} onClose={() => setIsBatchStatusModalOpen(false)} />

      <BatchActionBar
        selectedCount={selectedIds.length}
        onAssignCarrier={() => { fetchCouriers(); setIsBatchModalOpen(true); }}
        onChangeStatus={() => setIsBatchStatusModalOpen(true)}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
