'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';

import WorkersFilter from '@/components/filters/WorkersFilter';
import WorkersTable from '@/components/tables/WorkersTable';
import WorkerModal from '@/components/forms/modals/WorkerModal';

import { useApi, useModal } from '@/hooks';

// ─── Tipos ───────────────────────────────────────────────────
export interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  status: number;
  id_role: number;
}

// ─── Constantes ───────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;
const FILTER_FIELDS = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];

// ─── Helpers Externos ─────────────────────────────────────────
const getFilteredWorkers = (workers: Worker[], showInactive: boolean, field: string, value: string) => {
  const statusFiltered = workers.filter(w => showInactive ? w.status === 2 : w.status === 1 || w.status === 0);
  if (!field || !value) return statusFiltered;
  const val = value.toLowerCase();
  return statusFiltered.filter((worker) => {
    const fieldValue = worker[field as keyof Worker];
    return fieldValue?.toString().toLowerCase().includes(val);
  });
};

export default function WorkersPage() {
  // ─── State ──────────────────────────────────────────────────
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; data: Worker | null }>({ isOpen: false, data: null });
  const [deleting, setDeleting] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // ─── Hooks ──────────────────────────────────────────────────
  const { get, del, error: apiError } = useApi<any>();
  const workerModal = useModal<Worker>();

  // ─── Fetching ───────────────────────────────────────────────
  const fetchWorkers = useCallback(async () => {
    const response = await get('/user?type=workers');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setWorkers([...data].sort((a, b) => b.id - a.id));
    } else {
      setWorkers([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true);
    fetchWorkers().finally(() => setLoading(false));
  }, [fetchWorkers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [field, value, showInactive]);

  // ─── Data Derivada ──────────────────────────────────────────
  const filtered = useMemo(() => getFilteredWorkers(workers, showInactive, field, value), [workers, field, value, showInactive]);
  const currentItems = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);
  const totalItems = filtered.length;

  // ─── Handlers ───────────────────────────────────────────────
  const handleWorkerSubmit = async (worker: Omit<Worker, 'id'>) => {
    const isEditing = !!workerModal.data;
    if (isEditing) {
      const updated = { ...workerModal.data, ...worker, id: workerModal.data!.id } as Worker;
      setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w));
    } else {
      setWorkers(prev => [{ ...worker, id: Date.now() } as Worker, ...prev]);
    }
    setSuccessModal(isEditing ? 'El usuario ha sido actualizado correctamente.' : 'El usuario ha sido creado correctamente.');
    workerModal.closeModal();
  };

  const confirmDeleteWorker = async () => {
    if (!confirmModal.data) return;
    setDeleting(true);
    try {
      const response = await del(`/user/${confirmModal.data.id}`);
      if (response) {
        setWorkers(prev => prev.filter(w => w.id !== confirmModal.data!.id));
        setSuccessModal('El usuario ha sido eliminado correctamente.');
      } else {
        setErrorModal('No se pudo eliminar el usuario.');
      }
    } catch (err) {
      console.error("Worker delete error", err);
      setErrorModal('Ocurrió un error al intentar eliminar el usuario.');
    } finally {
      setDeleting(false);
      setConfirmModal({ isOpen: false, data: null });
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-500">
      <WorkersFilter
        field={field} setField={setField} value={value} setValue={setValue}
        filterFields={FILTER_FIELDS} onAdd={() => workerModal.openModal()}
        totalItems={totalItems} showInactive={showInactive} setShowInactive={setShowInactive}
      />

      <TableSection
        loading={loading} error={apiError && workers.length === 0 ? apiError : null}
        workers={currentItems} totalItems={totalItems} currentPage={currentPage}
        onPageChange={setCurrentPage} onFetch={fetchWorkers}
        onEdit={workerModal.openModal} onDelete={(w: Worker) => setConfirmModal({ isOpen: true, data: w })}
      />

      <WorkerModal isOpen={workerModal.isOpen} onClose={workerModal.closeModal} onSubmit={handleWorkerSubmit} editingWorker={workerModal.data} />

      <DeleteModal
        isOpen={confirmModal.isOpen} deleting={deleting} workerName={`${confirmModal.data?.first_name} ${confirmModal.data?.last_name || ''}`}
        onClose={() => setConfirmModal({ isOpen: false, data: null })} onConfirm={confirmDeleteWorker}
      />

      <FeedbackModals success={successModal} error={errorModal} onClose={() => { setSuccessModal(false); setErrorModal(null); }} />
    </div>
  );
}

// ─── Sub-componentes ───────────────────────────────────────────

function TableSection({ loading, error, workers, totalItems, currentPage, onPageChange, onFetch, onEdit, onDelete }: Readonly<any>) {
  if (loading) return <div className="flex justify-center items-center h-64"><DeliveryLoader message="Cargando usuarios..." /></div>;
  if (error) return (
    <div className="p-8 rounded-xl border border-red-100 bg-red-50 text-center text-red-600 flex flex-col items-center gap-2">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="font-medium">Error: {error}</p>
      <Button variant="secondary" size="sm" onClick={onFetch} className="mt-2">Reintentar</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <WorkersTable workers={workers} currentPage={currentPage} onEdit={onEdit} onDelete={onDelete} />
      {totalItems > 0 && (
        <div className="flex justify-center sm:justify-end">
          <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

function DeleteModal({ isOpen, deleting, workerName, onClose, onConfirm }: Readonly<any>) {
  return (
    <Modal isOpen={isOpen} onClose={deleting ? () => { } : onClose} size="sm" title={deleting ? "Eliminando..." : "Confirmar Eliminación"}
      footer={
        <ModalFooter>
          {deleting ? null : <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>}
          <Button onClick={onConfirm} disabled={deleting} variant="destructive" className="shadow-lg min-w-[100px]">
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50">
          {deleting ? <DeliveryLoader size="sm" /> : <XCircle className="w-6 h-6 text-red-600" />}
        </div>
        <p className="text-slate-600 font-medium mb-1">
            {deleting ? "Procesando..." : `¿Estás seguro de que deseas eliminar a "${workerName}"?`}
          </p>
          {!deleting && <p className="text-sm text-slate-400">Esta acción no se puede deshacer.</p>}
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