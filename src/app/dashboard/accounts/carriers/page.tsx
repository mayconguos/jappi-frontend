'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';

import CarriersFilter from '@/components/filters/CarriersFilter';
import CarriersTable from '@/components/tables/CarriersTable';
import CarrierModal from '@/components/forms/modals/CarrierModal';
import CarrierViewModal from '@/components/forms/modals/CarrierViewModal';

import { useApi, useModal } from '@/hooks';

// ─── Tipos ───────────────────────────────────────────────────
export interface Carrier {
  id: number;
  document_number: string;
  document_type: string;
  email: string;
  first_name: string;
  last_name: string | null;
  license: string;
  brand: string;
  model: string;
  plate_number: string;
  vehicle_type: string;
  status: number;
  id_role: number;
  password: string;
}

// ─── Constantes ───────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;
const FILTER_FIELDS = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];

// ─── Helpers Externos ─────────────────────────────────────────
const getFilteredCarriers = (carriers: Carrier[], showInactive: boolean, field: string, value: string) => {
  const statusFiltered = carriers.filter(c => showInactive ? c.status === 2 : c.status === 1 || c.status === 0);
  if (!field || !value) return statusFiltered;

  const val = value.toLowerCase();
  return statusFiltered.filter((carrier) => {
    const fieldValue = carrier[field as keyof Carrier];
    return fieldValue?.toString().toLowerCase().includes(val);
  });
};

export default function CarriersPage() {
  // ─── State ──────────────────────────────────────────────────
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; data: Carrier | null }>({ isOpen: false, data: null });
  const [deleting, setDeleting] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // ─── Hooks ──────────────────────────────────────────────────
  const { get, del, put, error: apiError } = useApi<any>();
  const carrierModal = useModal<Carrier>();
  const carrierViewModal = useModal<Carrier>();

  // ─── Fetching ───────────────────────────────────────────────
  const fetchCarriers = useCallback(async () => {
    const response = await get('/user?type=couriers');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setCarriers([...data].sort((a, b) => b.id - a.id));
    } else {
      setCarriers([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true);
    fetchCarriers().finally(() => setLoading(false));
  }, [fetchCarriers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [field, value, showInactive]);

  // ─── Data Derivada ──────────────────────────────────────────
  const filtered = useMemo(() => getFilteredCarriers(carriers, showInactive, field, value), [carriers, field, value, showInactive]);
  const currentItems = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);
  const totalItems = filtered.length;

  // ─── Handlers ───────────────────────────────────────────────
  const handleReactivateCarrier = async (carrier: Carrier) => {
    const response = await put(`/user/update/${carrier.id}`, { status: 1 });
    if (response) {
      setCarriers(prev => prev.map(c => c.id === carrier.id ? { ...c, status: 1 } : c));
      setSuccessModal('El transportista ha sido reactivado correctamente.');
    } else {
      setErrorModal('No se pudo reactivar el transportista.');
    }
  };

  const handleCarrierSubmit = async (carrier: Omit<Carrier, 'id'>) => {
    const isEditing = !!carrierModal.data;
    if (isEditing) {
      const updated = { ...carrierModal.data, ...carrier, id: carrierModal.data!.id } as Carrier;
      setCarriers(prev => prev.map(c => c.id === updated.id ? updated : c));
    } else {
      setCarriers(prev => [{ ...carrier, id: Date.now() } as Carrier, ...prev]);
    }
    setSuccessModal(isEditing ? 'El transportista ha sido actualizado.' : 'El transportista ha sido creado.');
    carrierModal.closeModal();
  };

  const confirmDeleteCarrier = async () => {
    if (!confirmModal.data) return;
    setDeleting(true);
    try {
      const response = await del(`/user/${confirmModal.data.id}`);
      if (response) {
        setCarriers(prev => prev.filter(c => c.id !== confirmModal.data!.id));
        setSuccessModal('Eliminado correctamente.');
      } else {
        setErrorModal('No se pudo eliminar.');
      }
    } catch {
      setErrorModal('Error inesperado.');
    } finally {
      setDeleting(false);
      setConfirmModal({ isOpen: false, data: null });
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-500">
      <CarriersFilter
        field={field} setField={setField} value={value} setValue={setValue}
        filterFields={FILTER_FIELDS} onAdd={() => carrierModal.openModal()}
        totalItems={totalItems} showInactive={showInactive} setShowInactive={setShowInactive}
      />

      <TableSection
        loading={loading} error={apiError && carriers.length === 0 ? apiError : null}
        carriers={currentItems} totalItems={totalItems} currentPage={currentPage}
        onPageChange={setCurrentPage} onFetch={fetchCarriers}
        onView={carrierViewModal.openModal} onEdit={carrierModal.openModal} onDelete={(c: any) => setConfirmModal({ isOpen: true, data: c })}
        onReactivate={handleReactivateCarrier}
      />

      <CarrierViewModal isOpen={carrierViewModal.isOpen} onClose={carrierViewModal.closeModal} carrier={carrierViewModal.data} />
      <CarrierModal isOpen={carrierModal.isOpen} onClose={carrierModal.closeModal} onSubmit={handleCarrierSubmit} editingCarrier={carrierModal.data} />

      <DeleteModal
        isOpen={confirmModal.isOpen} deleting={deleting} carrierName={`${confirmModal.data?.first_name} ${confirmModal.data?.last_name || ''}`}
        onClose={() => setConfirmModal({ isOpen: false, data: null })} onConfirm={confirmDeleteCarrier}
      />

      <FeedbackModals success={successModal} error={errorModal} onClose={() => { setSuccessModal(false); setErrorModal(null); }} />
    </div>
  );
}

// ─── Sub-componentes ───────────────────────────────────────────

function TableSection({ loading, error, carriers, totalItems, currentPage, onPageChange, onFetch, onView, onEdit, onDelete, onReactivate }: Readonly<any>) {
  if (loading) return <div className="flex justify-center items-center h-64"><DeliveryLoader message="Cargando..." /></div>;
  if (error) return (
    <div className="p-8 rounded-xl border border-red-100 bg-red-50 text-center text-red-600 flex flex-col items-center gap-2">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="font-medium">Error: {error}</p>
      <Button variant="secondary" size="sm" onClick={onFetch} className="mt-2">Reintentar</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <CarriersTable carriers={carriers} currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} onView={onView} onEdit={onEdit} onDelete={onDelete} onReactivate={onReactivate} />
      {totalItems > 0 && (
        <div className="flex justify-center sm:justify-end">
          <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

function DeleteModal({ isOpen, deleting, carrierName, onClose, onConfirm }: Readonly<any>) {
  return (
    <Modal isOpen={isOpen} onClose={deleting ? () => { } : onClose} size="sm" title={deleting ? "Eliminando..." : "Confirmar"}
      footer={
        <ModalFooter>
          {deleting ? null : <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>}
          <Button onClick={onConfirm} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[100px]">
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50">
          {deleting ? <DeliveryLoader size="sm" /> : <XCircle className="w-6 h-6 text-red-600" />}
        </div>
        <p className="text-gray-600">{deleting ? "Procesando..." : `¿Deseas eliminar a ${carrierName}?`}</p>
      </div>
    </Modal>
  );
}

function FeedbackModals({ success, error, onClose }: Readonly<{ success: string | boolean; error: string | null; onClose: () => void }>) {
  if (!success && !error) return null;
  const isSuccess = !!success;
    let message = error;
    if (isSuccess) {
      message = typeof success === 'string' ? success : 'Completado.';
    }

    return (
      <Modal isOpen={true} onClose={onClose} size="sm" title={isSuccess ? "¡Éxito!" : "Error"}
        footer={
          <ModalFooter className="justify-center">
            <Button onClick={onClose} className={`${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white shadow-lg min-w-[100px]`}>
              {isSuccess ? 'Aceptar' : 'Cerrar'}
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
            {isSuccess ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
          </div>
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      </Modal>
    );
}
