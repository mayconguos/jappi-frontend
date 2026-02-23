'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import PickupsFilter from '@/components/filters/PickupsFilter';
import PickupsTable from '@/components/tables/PickupsTable';
import { Pagination } from '@/components/ui/pagination';
import { useApi } from '@/hooks';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Truck, RefreshCw } from 'lucide-react';
import DeliveryLoader from '@/components/ui/delivery-loader';

// ─── Constantes ───────────────────────────────────────────────
const STATUS_LABELS: Record<PickupStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  picked_up: 'Recogido',
  received: 'Recibido',
};

// ─── Tipos ────────────────────────────────────────────────────
export type PickupStatus = 'pending' | 'scheduled' | 'picked_up' | 'received';

export interface Pickup {
  id: number;
  created_at: string;
  pickup_date: string;
  seller: string;
  carrier: string;
  district: string;
  address: string;
  packages: number;
  status: PickupStatus;
  observation?: string;
}

export interface ApiPickup {
  id: number;
  status: PickupStatus;
  pickup_date: string;
  company_name: string;
  phone: string;
  address: string;
  district_name: string;
  items: {
    product_name: string;
    quantity: number;
  }[];
  driver_name: string | null;
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

// ─── Helper de Mapeo ───────────────────────────────────────────
const mapApiPickupToPickup = (apiPickup: ApiPickup): Pickup => {
  const date = apiPickup.pickup_date ? new Date(apiPickup.pickup_date) : new Date();
  const dateStr = !isNaN(date.getTime())
    ? date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Fecha inválida';

  // Intentar encontrar la lista de items en varias propiedades comunes si no está en .items
  const items = apiPickup.items || (apiPickup as any).details || (apiPickup as any).shipping_items || [];

  return {
    id: apiPickup.id,
    created_at: dateStr,
    pickup_date: dateStr,
    seller: apiPickup.company_name,
    carrier: apiPickup.driver_name || 'Sin asignar',
    district: apiPickup.district_name,
    address: apiPickup.address,
    packages: Array.isArray(items) ? items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
    status: apiPickup.status,
    observation: undefined,
  };
};

// ─── Data estática ─────────────────────────────────────────────
const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- Carrier Flow State ---
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isFetchingCouriers, setIsFetchingCouriers] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);
  const [isUpdatingCarrier, setIsUpdatingCarrier] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedChange, setSelectedChange] = useState<{ pickupId: number; courierName: string } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ pickupId: number; status: PickupStatus } | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<{ title: string; message: string } | null>(null);

  const { get } = useApi<any>();

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchPickups = async () => {
      setIsInitialLoading(true);
      try {
        console.log('Fetching pickups from /shipping/pickup...');
        const resp = await get('/shipping/pickup');
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
  }, [field, value]);

  const filteredPickups = useMemo(() => {
    if (!value) return pickups;

    const searchTerm = value.toLowerCase();
    return pickups.filter((p) => {
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
  }, [field, value, pickups]);

  const totalItems = filteredPickups.length;
  const currentItems = filteredPickups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExportExcel = () => console.log('Exporting Excel...');
  const handleExportPdf = () => console.log('Exporting PDF...');

  const handleViewPickup = (pickup: Pickup) => {
    console.log('Viewing pickup', pickup);
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

    // Simular golpe a API
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPickups(prev => prev.map(p =>
      p.id === pendingStatusChange.pickupId ? { ...p, status: pendingStatusChange.status } : p
    ));

    setIsUpdatingStatus(false);
    setIsConfirmStatusModalOpen(false);
    setPendingStatusChange(null);
    setSuccessModal('El estado del recojo ha sido actualizado correctamente.');
  };

  const handleCarrierSelect = (id: number, carrierName: string) => {
    const pickup = pickups.find(p => p.id === id);
    if (!pickup) return;

    // Bloqueo estricto si el estado es Recibido
    if (pickup.status === 'received') {
      setWarningModal({
        title: 'Acción Bloqueada',
        message: 'No se puede modificar el transportista de un recojo ya Recibido.'
      });
      return;
    }

    if (carrierName === 'Sin asignar' && pickup.status === 'scheduled') {
      setWarningModal({
        title: 'Transportista Obligatorio',
        message: 'No se puede desasignar el transportista si el estado actual es Programado.'
      });
      return;
    }

    if (carrierName === pickup.carrier) return;

    setSelectedChange({ pickupId: id, courierName: carrierName });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCarrierUpdate = async () => {
    if (!selectedChange) return;
    setIsUpdatingCarrier(true);

    // Simular golpe a API
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPickups(prev => prev.map(p =>
      p.id === selectedChange.pickupId ? { ...p, carrier: selectedChange.courierName } : p
    ));

    setIsUpdatingCarrier(false);
    setIsConfirmModalOpen(false);
    setSelectedChange(null);
    setSuccessModal('El transportista ha sido asignado correctamente.');
  };

  const handleCancel = (id: number) => {
    if (confirm('¿Estás seguro que deseas cancelar este recojo?')) {
      setPickups(prev => prev.filter(p => p.id !== id));
    }
  };

  if (isInitialLoading) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-4">
        <DeliveryLoader message="Cargando información de recojos..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8">
      <PickupsFilter
        field={field}
        setField={setField}
        value={value}
        setValue={setValue}
        filterFields={FILTER_FIELDS}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        totalItems={totalItems}
      />

      <div className="flex flex-col gap-6">
        <PickupsTable
          pickups={currentItems}
          currentPage={currentPage}
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

        {totalItems === 0 && value && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-slate-400">No se encontraron resultados para "{value}"</p>
          </div>
        )}
      </div>

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
      {/* Warning Modal */}
      {warningModal && (
        <Modal
          isOpen={!!warningModal}
          onClose={() => setWarningModal(null)}
          size="sm"
          title={warningModal.title}
          footer={
            <ModalFooter className="justify-center">
              <Button onClick={() => setWarningModal(null)} className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
                Entendido
              </Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-slate-600 font-medium">
              {warningModal.message}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
