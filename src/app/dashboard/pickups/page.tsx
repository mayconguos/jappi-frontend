'use client';

import { useState, useMemo, useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';
import BatchActionBar from '@/components/ui/BatchActionBar';

import DataTableFilter from '@/components/filters/DataTableFilter';
import PickupsTable from '@/components/tables/PickupsTable';

import { AssignCarrierModal, ChangeStatusModal, CancelConfirmModal, BatchAssignModal, BatchStatusModal } from '@/components/modals/ActionModals';
import { SuccessModal, WarningModal } from '@/components/modals/FeedbackModals';

import { Pickup, ApiPickup, PickupStatus } from '@/types/pickup';
import { useTableActions } from '@/hooks/useTableActions';

// ─── Constantes ───────────────────────────────────────────────
const STATUS_LABELS: Record<PickupStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  picked_up: 'Recogido',
  received: 'Recibido',
};

// ─── Helper de Mapeo ───────────────────────────────────────────
const mapApiPickupToPickup = (apiPickup: ApiPickup): Pickup => {
  const date = apiPickup.pickup_date ? new Date(apiPickup.pickup_date) : new Date();
  const dateStr = Number.isNaN(date.getTime())
    ? 'Fecha inválida'
    : date.toISOString().split('T')[0].split('-').reverse().join('/');

  return {
    id: apiPickup.id,
    id_driver: apiPickup.id_driver || null,
    address: apiPickup.address,
    carrier: apiPickup.driver_name || 'Sin asignar',
    created_at: dateStr,
    district: apiPickup.district_name,
    observation: undefined,
    origin: apiPickup.origin === 'supply' ? 'warehouse' : 'pickup',
    packages: apiPickup.package_count || 0,
    phone: apiPickup.phone || 'Sin teléfono',
    pickup_date: dateStr,
    seller: apiPickup.company_name,
    status: apiPickup.status,
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

export default function PickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
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
    pickup: Pickup | null;
    items: { id: number; product_name: string; quantity: number }[];
    loading: boolean;
    error: string | null;
  }>({ isOpen: false, pickup: null, items: [], loading: false, error: null });

  const actions = useTableActions<PickupStatus>();
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
    entityToCancel: pickupToCancel, setEntityToCancel: setPickupToCancel,
    put, get,
  } = actions;

  // ─── Initial Fetch ────────────────────────────────────────────
  useEffect(() => {
    const fetchPickups = async () => {
      setIsInitialLoading(true);
      try {
        const resp = await get('/pickup');
        const data = Array.isArray(resp) ? resp : (resp as any)?.data;
        if (data && Array.isArray(data)) setPickups(data.map(mapApiPickupToPickup));
      } catch (err) {
        console.error('Error fetching pickups:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchPickups();
  }, [get]);

  useEffect(() => { setCurrentPage(1); }, [field, value, dateRange]);

  // ─── Filtered & Paginated Data ────────────────────────────────
  const filteredPickups = useMemo(() => {
    let filtered = pickups;
    if (dateRange.from) {
      const fDate = new Date(dateRange.from);
      fDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => {
        const pDate = new Date(p.pickup_date.split('/').reverse().join('-'));
        pDate.setHours(0, 0, 0, 0);
        return pDate >= fDate;
      });
    }
    if (dateRange.to) {
      const tDate = new Date(dateRange.to);
      tDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => {
        const pDate = new Date(p.pickup_date.split('/').reverse().join('-'));
        pDate.setHours(23, 59, 59, 999);
        return pDate <= tDate;
      });
    }
    if (!value) return filtered;
    const searchTerm = value.toLowerCase();
    return filtered.filter(p => {
      if (field === 'all') return p.seller.toLowerCase().includes(searchTerm) || p.carrier.toLowerCase().includes(searchTerm) || p.district.toLowerCase().includes(searchTerm);
      const fieldValue = p[field as keyof Pickup];
      return fieldValue ? String(fieldValue).toLowerCase().includes(searchTerm) : false;
    });
  }, [field, value, pickups, dateRange]);

  const totalItems = filteredPickups.length;
  const currentItems = filteredPickups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────

  const handleViewPickup = async (pickup: Pickup) => {
    setViewDetails({ isOpen: true, pickup, items: [], loading: true, error: null });
    try {
      const resp = await get(`/pickup/detail/${pickup.id}`);
      const items = Array.isArray(resp) ? resp : ((resp as any)?.data || []);
      setViewDetails(prev => ({ ...prev, loading: false, items }));
    } catch (err: any) {
      setViewDetails(prev => ({ ...prev, loading: false, error: err.message || 'Error al cargar los detalles' }));
    }
  };

  const handleStatusChange = (id: number, status: PickupStatus) => {
    const pickup = pickups.find(p => p.id === id);
    if (!pickup) return;
    if (pickup.status === 'received') { setWarningModal({ title: 'Acción Bloqueada', message: 'No se puede modificar un recojo que ya ha sido Recibido.' }); return; }
    if ((status === 'scheduled' || status === 'received') && (pickup.carrier === 'Sin asignar' || !pickup.carrier)) { setWarningModal({ title: 'Asignación Requerida', message: 'No se puede cambiar el estado a Programado o Recibido sin asignar un transportista previo.' }); return; }
    if (status === 'received' && pickup.status !== 'picked_up') { setWarningModal({ title: 'Recojo Pendiente', message: 'No se puede marcar como Recibido hasta que el transportista haya marcado el recojo como Recogido.' }); return; }
    setPendingStatusChange({ entityId: id, status });
    setIsConfirmStatusModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusChange) return;
    setIsUpdatingStatus(true);
    try {
      const response = await put('/pickup/status', [{ id_pickup: pendingStatusChange.entityId, status: pendingStatusChange.status }]);
      if (!response) throw new Error('Hubo un error comunicándose con el servidor.');
      setPickups(prev => prev.map(p => p.id === pendingStatusChange.entityId ? { ...p, status: pendingStatusChange.status } : p));
      setSuccessModal('El estado del recojo ha sido actualizado correctamente.');
    } catch (err: any) {
      setWarningModal({ title: 'Error al cambiar estado', message: err.message || 'Ocurrió un error al intentar cambiar el estado.' });
    } finally {
      setIsUpdatingStatus(false);
      setIsConfirmStatusModalOpen(false);
      setPendingStatusChange(null);
    }
  };

  const handleCarrierSelect = (id: number, driverIdStr: string) => {
    const pickup = pickups.find(p => p.id === id);
    if (!pickup) return;
    if (pickup.status === 'received') { setWarningModal({ title: 'Acción Bloqueada', message: 'No se puede modificar el transportista de un recojo ya Recibido.' }); return; }
    if (driverIdStr === '0' && pickup.status === 'scheduled') { setWarningModal({ title: 'Transportista Obligatorio', message: 'No se puede desasignar el transportista si el estado actual es Programado.' }); return; }
    const currentDriverStr = pickup.id_driver?.toString() || '0';
    if (driverIdStr === currentDriverStr) return;
    const courier = couriers.find(c => c.id.toString() === driverIdStr);
    const courierName = courier ? `${courier.first_name} ${courier.last_name || ''}`.trim() : 'Sin asignar';
    setSelectedChange({ entityId: id, courierId: Number.parseInt(driverIdStr), courierName });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCarrierUpdate = async () => {
    if (!selectedChange) return;
    setIsUpdatingCarrier(true);
    const driverId = selectedChange.courierId;
    try {
      const response = await put('/pickup/assign', { assignments: [{ id_pickup: selectedChange.entityId, id_driver: driverId }] });
      if (!response) throw new Error('Hubo un error comunicándose con el servidor.');
      const isUnassigning = driverId === 0;
      setPickups(prev => prev.map(p => p.id === selectedChange.entityId ? { ...p, carrier: selectedChange.courierName, id_driver: driverId === 0 ? null : driverId, status: isUnassigning ? p.status : 'scheduled' } : p));
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
    const driverId = Number.parseInt(batchCarrier);
    const courier = couriers.find(c => c.id === driverId);
    const courierName = courier ? `${courier.first_name} ${courier.last_name || ''}`.trim() : 'Sin asignar';
    try {
      const response = await put('/pickup/assign', { assignments: selectedIds.map(id => ({ id_pickup: id, id_driver: driverId })) });
      if (!response) throw new Error('No se pudo completar la asignación masiva en el servidor.');
      const isUnassigning = driverId === 0;
      setPickups(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, carrier: courierName, id_driver: driverId === 0 ? null : driverId, status: isUnassigning ? p.status : 'scheduled' } : p));
      setSuccessModal(`Se ha asignado correctamente a ${courierName} para los ${selectedIds.length} recojos seleccionados.`);
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
      const response = await put('/pickup/status', selectedIds.map(id => ({ id_pickup: id, status: batchStatus })));
      if (!response) throw new Error('No se pudo completar el cambio de estado masivo en el servidor.');
      setPickups(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: batchStatus } : p));
      setSuccessModal(`Se ha actualizado el estado a ${STATUS_LABELS[batchStatus]} para los ${selectedIds.length} recojos seleccionados.`);
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
    if (pickupToCancel !== null) {
      setPickups(prev => prev.filter(p => p.id !== pickupToCancel));
      setPickupToCancel(null);
      setSuccessModal('El recojo ha sido cancelado exitosamente.');
    }
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
          <AlertTriangle size={32} className="mb-3" />
          <p className="font-medium text-red-800">{viewDetails.error}</p>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-300 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="col-span-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Vendedor / Tienda</span>
            <span className="font-semibold text-slate-900 block mt-1.5">{viewDetails.pickup?.seller}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Dirección de Recojo</span>
            <span className="font-medium text-slate-700 block mt-1.5">{viewDetails.pickup?.address}</span>
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Productos a Recoger</h4>
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
              No se encontraron productos asociados al recojo.
            </p>
          )}
        </div>
      </div>
    );
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
          <DeliveryLoader message="Cargando información de recojos..." />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <PickupsTable
            pickups={currentItems}
            currentPage={currentPage}
            selectedIds={selectedIds}
            onSelectOne={handleSelectOne}
            onSelectAll={handleSelectAll}
            onView={handleViewPickup}
            onStatusChange={handleStatusChange}
            onCarrierChange={handleCarrierSelect}
            onCancel={id => setPickupToCancel(id)}
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

      {/* View Details Modal (specific to pickups) */}
      <Modal
        isOpen={viewDetails.isOpen}
        onClose={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}
        size="md"
        title={`Detalles del Recojo #${viewDetails.pickup?.id}`}
        footer={<ModalFooter className="flex justify-end pt-2"><Button onClick={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}>Cerrar</Button></ModalFooter>}
      >
        <div className="py-2 space-y-6">
          {renderModalContent()}
        </div>
      </Modal>


      {/* Shared Modals */}
      <CancelConfirmModal isOpen={pickupToCancel !== null} entityLabel="Recojo" onConfirm={confirmCancel} onClose={() => setPickupToCancel(null)} />
      <AssignCarrierModal isOpen={isConfirmModalOpen} isLoading={isUpdatingCarrier} courierName={selectedChange?.courierName} entityLabel="recojo" onConfirm={handleConfirmCarrierUpdate} onClose={() => setIsConfirmModalOpen(false)} />
      <ChangeStatusModal isOpen={isConfirmStatusModalOpen} isLoading={isUpdatingStatus} statusLabel={pendingStatusChange ? STATUS_LABELS[pendingStatusChange.status] : ''} onConfirm={handleConfirmStatusUpdate} onClose={() => setIsConfirmStatusModalOpen(false)} />
      <SuccessModal message={successModal} onClose={() => setSuccessModal(null)} />
      <WarningModal modal={warningModal} onClose={() => setWarningModal(null)} />
      <BatchAssignModal isOpen={isBatchModalOpen} isLoading={isUpdatingCarrier} selectedCount={selectedIds.length} entityLabelPlural="recojos" couriers={couriers} value={batchCarrier} onChange={setBatchCarrier} onConfirm={handleBatchCarrierUpdate} onClose={() => setIsBatchModalOpen(false)} />
      <BatchStatusModal isOpen={isBatchStatusModalOpen} isLoading={isUpdatingStatus} selectedCount={selectedIds.length} entityLabelPlural="recojos" statusOptions={STATUS_OPTIONS} value={batchStatus} onChange={v => setBatchStatus(v as PickupStatus)} onConfirm={handleBatchStatusUpdate} onClose={() => setIsBatchStatusModalOpen(false)} />

      <BatchActionBar
        selectedCount={selectedIds.length}
        onAssignCarrier={() => { fetchCouriers(); setIsBatchModalOpen(true); }}
        onChangeStatus={() => setIsBatchStatusModalOpen(true)}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
