'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

import { CheckCircle, AlertTriangle, Truck, RefreshCw } from 'lucide-react';

import { useApi } from '@/hooks';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import DeliveryLoader from '@/components/ui/delivery-loader';

import DataTableFilter from '@/components/filters/DataTableFilter';
import PickupsTable from '@/components/tables/PickupsTable';

// ─── Constantes ───────────────────────────────────────────────
const STATUS_LABELS: Record<PickupStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  picked_up: 'Recogido',
  received: 'Recibido',
};

// ─── Tipos ────────────────────────────────────────────────────
import { Pickup, ApiPickup, PickupStatus } from '@/types/pickup';
import { Courier } from '@/types/courier';

// ─── Helper de Mapeo ───────────────────────────────────────────
const mapApiPickupToPickup = (apiPickup: ApiPickup): Pickup => {
  const date = apiPickup.pickup_date ? new Date(apiPickup.pickup_date) : new Date();
  const dateStr = !isNaN(date.getTime())
    ? date.toISOString().split('T')[0].split('-').reverse().join('/')
    : 'Fecha inválida';

  // Intentar encontrar la lista de items en varias propiedades comunes si no está en .items
  const items = apiPickup.items || (apiPickup as any).details || (apiPickup as any).shipping_items || [];

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

export default function PickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
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
  const [selectedChange, setSelectedChange] = useState<{ pickupId: number; courierId: number; courierName: string } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ pickupId: number; status: PickupStatus } | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<{ title: string; message: string } | null>(null);

  // --- Multi-select State ---
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchStatusModalOpen, setIsBatchStatusModalOpen] = useState(false);
  const [batchCarrier, setBatchCarrier] = useState<string>('');
  const [batchStatus, setBatchStatus] = useState<PickupStatus | ''>('');

  // --- View Pickup State ---
  const [viewDetails, setViewDetails] = useState<{
    isOpen: boolean;
    pickup: Pickup | null;
    items: { id: number; product_name: string; quantity: number }[];
    loading: boolean;
    error: string | null;
  }>({ isOpen: false, pickup: null, items: [], loading: false, error: null });

  // --- Cancel Pickup State ---
  const [pickupToCancel, setPickupToCancel] = useState<number | null>(null);

  const { get, put } = useApi<any>();

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchPickups = async () => {
      setIsInitialLoading(true);
      try {
        console.log('Fetching pickups from /pickup...');
        const resp = await get('/pickup');
        console.log('Pickups API Response:', resp);

        // Intentar detectar si la data está envuelta en un objeto { data: [...] }
        const data = Array.isArray(resp) ? resp : (resp as any)?.data;

        if (data && Array.isArray(data)) {
          console.log(`Mapping ${data.length} pickups...`);
          const mapped = data.map(mapApiPickupToPickup);
          setPickups(mapped);
        } else {
          console.warn('API Response is not an array or does not contain a "data" array:', resp);
        }
      } catch (err) {
        console.error('Error fetching pickups:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchPickups();
  }, [get]);

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

  const filteredPickups = useMemo(() => {
    let filtered = pickups;

    // Filter by Date Range
    if (dateRange.from) {
      const fDate = new Date(dateRange.from);
      fDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => {
        const pDate = new Date(p.pickup_date.split('/').reverse().join('-')); // DD/MM/YYYY to YYYY-MM-DD
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
    return filtered.filter((p) => {
      if (field === 'all') {
        return (
          p.seller.toLowerCase().includes(searchTerm) ||
          p.carrier.toLowerCase().includes(searchTerm) ||
          p.district.toLowerCase().includes(searchTerm)
        );
      }

      const fieldValue = p[field as keyof Pickup];
      return fieldValue
        ? String(fieldValue).toLowerCase().includes(searchTerm)
        : false;
    });
  }, [field, value, pickups, dateRange]);

  const totalItems = filteredPickups.length;
  const currentItems = filteredPickups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExportExcel = () => console.log('Exporting Excel...');

  const handleViewPickup = async (pickup: Pickup) => {
    setViewDetails({ isOpen: true, pickup, items: [], loading: true, error: null });
    try {
      const resp = await get(`/pickup/detail/${pickup.id}`);
      const items = Array.isArray(resp) ? resp : (resp?.data || []);
      setViewDetails(prev => ({ ...prev, loading: false, items }));
    } catch (err: any) {
      setViewDetails(prev => ({ ...prev, loading: false, error: err.message || 'Error al cargar los detalles' }));
    }
  };

  const handleStatusChange = (id: number, status: PickupStatus) => {
    const pickup = pickups.find(p => p.id === id);
    if (!pickup) return;

    // Bloqueo estricto: Si ya está en Recibido, no se puede cambiar a ningún otro estado
    if (pickup.status === 'received') {
      setWarningModal({
        title: 'Acción Bloqueada',
        message: 'No se puede modificar un recojo que ya ha sido Recibido.'
      });
      return;
    }

    if ((status === 'scheduled' || status === 'received') && (pickup.carrier === 'Sin asignar' || !pickup.carrier)) {
      setWarningModal({
        title: 'Asignación Requerida',
        message: 'No se puede cambiar el estado a Programado o Recibido sin asignar un transportista previo.'
      });
      return;
    }

    if (status === 'received' && pickup.status !== 'picked_up') {
      setWarningModal({
        title: 'Recojo Pendiente',
        message: 'No se puede marcar como Recibido hasta que el transportista haya marcado el recojo como Recogido.'
      });
      return;
    }

    setPendingStatusChange({ pickupId: id, status });
    setIsConfirmStatusModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusChange) return;
    setIsUpdatingStatus(true);

    try {
      const payload = [{
        id_pickup: pendingStatusChange.pickupId,
        status: pendingStatusChange.status
      }];

      const response = await put('/pickup/status', payload);
      if (!response) {
        throw new Error('Hubo un error comunicándose con el servidor.');
      }

      setPickups(prev => prev.map(p =>
        p.id === pendingStatusChange.pickupId ? { ...p, status: pendingStatusChange.status } : p
      ));

      setSuccessModal('El estado del recojo ha sido actualizado correctamente.');
    } catch (err: any) {
      setWarningModal({
        title: 'Error al cambiar estado',
        message: err.message || 'Ocurrió un error al intentar cambiar el estado.'
      });
    } finally {
      setIsUpdatingStatus(false);
      setIsConfirmStatusModalOpen(false);
      setPendingStatusChange(null);
    }
  };

  const handleCarrierSelect = (id: number, driverIdStr: string) => {
    const pickup = pickups.find(p => p.id === id);
    if (!pickup) return;

    if (pickup.status === 'received') {
      setWarningModal({
        title: 'Acción Bloqueada',
        message: 'No se puede modificar el transportista de un recojo ya Recibido.'
      });
      return;
    }

    if (driverIdStr === '0' && pickup.status === 'scheduled') {
      setWarningModal({
        title: 'Transportista Obligatorio',
        message: 'No se puede desasignar el transportista si el estado actual es Programado.'
      });
      return;
    }

    const currentDriverStr = pickup.id_driver?.toString() || '0';
    if (driverIdStr === currentDriverStr) return;

    const courier = couriers.find(c => c.id.toString() === driverIdStr);
    const courierName = courier ? `${courier.first_name} ${courier.last_name || ''}`.trim() : 'Sin asignar';

    setSelectedChange({ pickupId: id, courierId: parseInt(driverIdStr), courierName });
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
            id_pickup: selectedChange.pickupId,
            id_driver: driverId
          }
        ]
      };

      const response = await put('/pickup/assign', payload);
      if (!response) {
        throw new Error('Hubo un error comunicándose con el servidor.');
      }

      const isUnassigning = driverId === 0;

      setPickups(prev => prev.map(p =>
        p.id === selectedChange.pickupId
          ? {
            ...p,
            carrier: selectedChange.courierName,
            id_driver: driverId === 0 ? null : driverId,
            status: !isUnassigning ? 'scheduled' : p.status
          }
          : p
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
    setPickupToCancel(id);
  };

  const confirmCancel = () => {
    if (pickupToCancel !== null) {
      setPickups(prev => prev.filter(p => p.id !== pickupToCancel));
      setPickupToCancel(null);
      setSuccessModal('El recojo ha sido cancelado exitosamente.');
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

      const response = await put('/pickup/assign', payload);
      if (!response) {
        throw new Error('No se pudo completar la asignación masiva en el servidor.');
      }

      const isUnassigning = driverId === 0;

      setPickups(prev => prev.map(p =>
        selectedIds.includes(p.id)
          ? {
            ...p,
            carrier: courierName,
            id_driver: driverId === 0 ? null : driverId,
            status: !isUnassigning ? 'scheduled' : p.status
          }
          : p
      ));

      setSuccessModal(`Se ha asignado correctamente a ${courierName} para los ${selectedIds.length} recojos seleccionados.`);
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

    try {
      const payload = selectedIds.map(id => ({
        id_pickup: id,
        status: batchStatus
      }));

      const response = await put('/pickup/status', payload);
      if (!response) {
        throw new Error('No se pudo completar el cambio de estado masivo en el servidor.');
      }

      setPickups(prev => prev.map(p =>
        selectedIds.includes(p.id) ? { ...p, status: batchStatus as PickupStatus } : p
      ));

      setSuccessModal(`Se ha actualizado el estado a ${STATUS_LABELS[batchStatus as PickupStatus]} para los ${selectedIds.length} recojos seleccionados.`);
    } catch (err: any) {
      setWarningModal({
        title: 'Error de Cambio de Estado Masivo',
        message: err.message || 'Ocurrió un error al intentar cambiar el estado masivamente.'
      });
    } finally {
      setIsUpdatingStatus(false);
      setIsBatchStatusModalOpen(false);
      setSelectedIds([]);
      setBatchStatus('');
    }
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

      {/* View Details Modal */}
      <Modal
        isOpen={viewDetails.isOpen}
        onClose={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}
        size="md"
        title={`Detalles del Recojo #${viewDetails.pickup?.id}`}
        footer={
          <ModalFooter className="flex justify-end pt-2">
            <Button onClick={() => setViewDetails(prev => ({ ...prev, isOpen: false }))}>
              Cerrar
            </Button>
          </ModalFooter>
        }
      >
        <div className="py-2 space-y-6">
          {viewDetails.loading ? (
            <div className="h-40 flex items-center justify-center">
              <DeliveryLoader message="Cargando detalles..." />
            </div>
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
                  <span className="font-semibold text-slate-900 block mt-1.5">{viewDetails.pickup?.seller}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Dirección de Recojo</span>
                  <span className="font-medium text-slate-700 block mt-1.5">{viewDetails.pickup?.address}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Productos a Recoger
                </h4>
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
          )}
        </div>
      </Modal>

      {/* Confirmation Cancel Modal */}
      <Modal
        isOpen={pickupToCancel !== null}
        onClose={() => setPickupToCancel(null)}
        size="sm"
        title="Cancelar Recojo"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setPickupToCancel(null)}
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
                ¿Estás seguro que deseas asignar a <span className="font-bold text-slate-900">"{selectedChange?.courierName}"</span> para este recojo?
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
              Asignar un transportista a los <span className="font-bold text-slate-900">{selectedIds.length}</span> recojos seleccionados.
            </p>
            <p className="text-xs text-slate-400 mt-1">Los recojos pasarán automáticamente a estado "Programado".</p>
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
              Cambiar el estado de los <span className="font-bold text-slate-900">{selectedIds.length}</span> recojos seleccionados.
            </p>
            <p className="text-xs text-slate-400 mt-1">Este cambio afectará el flujo logístico de todos los pedidos seleccionados.</p>
          </div>
          <div className="w-full pt-2">
            <Select
              label="Nuevo Estado"
              value={batchStatus}
              onChange={(val) => setBatchStatus(val as PickupStatus)}
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
                Asignar Carrier
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
