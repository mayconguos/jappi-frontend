
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';

// Componentes
import WorkersFilter from '@/components/filters/WorkersFilter';
import WorkersTable from '@/components/tables/WorkersTable';
import WorkerModal from '@/components/forms/modals/WorkerModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Pagination } from '@/components/ui/pagination';
// Hooks personalizados
import { useApi, useModal } from '@/hooks';


// --- Tipos ---
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


// --- Constantes ---
const ITEMS_PER_PAGE = 10;
const filterFields = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];


export default function WorkersPage() {
  // --- State ---
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    data: Worker | null;
  }>({ isOpen: false, data: null });
  const [deleting, setDeleting] = useState(false);

  // --- Hooks ---
  const { get, del, error: apiError } = useApi<Worker[]>();
  const workerModal = useModal<Worker>();

  // --- Effects ---
  // Resetear paginación al cambiar filtro o valor
  useEffect(() => {
    setCurrentPage(1);
  }, [field, value]);

  // --- Data Fetching ---
  const fetchWorkers = useCallback(async () => {
    const response = await get('/user?type=workers');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setWorkers(data);
    } else {
      setWorkers([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true);
    fetchWorkers().finally(() => setLoading(false));
  }, [fetchWorkers]);

  // Mostrar error de carga de API si ocurre
  const showApiError = !loading && apiError && workers.length === 0;

  // --- Derived Data ---
  const filtered = useMemo(() => {
    if (!field) return workers;
    const val = value.toLowerCase();
    return workers.filter((worker) => {
      const fieldValue = worker[field as keyof Worker];
      return fieldValue ? fieldValue.toString().toLowerCase().includes(val) : false;
    });
  }, [workers, field, value]);

  const totalItems = filtered.length;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Handlers ---
  const handlePageChange: (page: number) => void = (page) => setCurrentPage(page);

  const handleDeleteWorker: (worker: Worker) => void = (worker) => setConfirmModal({ isOpen: true, data: worker });

  const handleEditWorker: (worker: Worker) => void = (worker) => workerModal.openModal(worker);

  const handleAddWorker: () => void = () => {
    workerModal.openModal();
  };

  const handleWorkerSubmit: (worker: Omit<Worker, 'id'>, editingWorker?: Worker | null) => void = (worker, editingWorker) => {
    if (editingWorker) {
      const updatedWorker = { ...editingWorker, ...worker, id: editingWorker.id };
      setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
    } else {
      const workerWithId = { ...worker, id: Date.now() };
      setWorkers(prev => [...prev, workerWithId]);
    }
  };

  const handleWorkerModalSubmit = async (worker: Omit<Worker, 'id'>) => {
    try {
      const isEditing = !!workerModal.data;
      await handleWorkerSubmit(worker, workerModal.data);
      setSuccessModal(isEditing ? 'El usuario ha sido actualizado correctamente.' : 'El usuario ha sido creado correctamente.');
    } catch {
      setErrorModal('Hubo un error al procesar la solicitud.');
    } finally {
      workerModal.closeModal();
    }
  };

  const confirmDeleteWorker = async () => {
    if (confirmModal.data) {
      setDeleting(true);
      const workerId = confirmModal.data.id;
      const response = await del(`/user/${workerId}`);
      setDeleting(false);
      closeConfirmModal();
      if (response !== null) {
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        setSuccessModal('El usuario ha sido eliminado correctamente.');
      } else {
        setErrorModal('No se pudo eliminar el usuario.');
      }
    }
  };

  const closeConfirmModal = () => setConfirmModal({ isOpen: false, data: null });

  const closeStatusModals = () => {
    setSuccessModal(false);
    setErrorModal(null);
  };

  // --- Render ---
  return (
    <section className="p-6 space-y-6">
      {/* Filtros y botón para añadir worker */}
      <WorkersFilter
        {...{
          field,
          setField,
          value,
          setValue,
          filterFields,
          onAdd: handleAddWorker,
        }}
      />

      {/* Loader */}
      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando usuarios..." />
        </div>
      )}

      {/* Error de carga de API */}
      {showApiError && (
        <div className="text-center py-4 text-red-500">
          Error al cargar los trabajadores: {apiError}
        </div>
      )}

      {/* Sin datos */}
      {!loading && !showApiError && filtered.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay trabajadores disponibles.
        </div>
      )}

      {/* Tabla y paginación */}
      {!loading && (
        <>
          <WorkersTable
            {...{
              workers: currentItems,
              currentPage,
              onEdit: handleEditWorker,
              onDelete: handleDeleteWorker,
            }}
          />
          <Pagination
            {...{
              currentPage,
              totalItems,
              itemsPerPage: ITEMS_PER_PAGE,
              onPageChange: handlePageChange,
            }}
          />
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={deleting ? () => { } : closeConfirmModal}
            onConfirm={deleting ? () => { } : confirmDeleteWorker}
            title={deleting ? "Eliminando usuario..." : "Confirmar eliminación"}
            message={
              deleting
                ? "Eliminando usuario..."
                : `¿Estás seguro de que deseas eliminar a ${confirmModal.data?.first_name} ${confirmModal.data?.last_name}?`
            }
            confirmText={deleting ? "Eliminando..." : "Eliminar"}
            variant="danger"
          />
          {deleting && (
            <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 z-50">
              <div className="bg-white rounded-lg p-16 shadow-lg flex flex-col items-center">
                <DeliveryLoader message="Eliminando usuario..." />
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal para añadir o editar usuario */}
      <WorkerModal
        {...{
          isOpen: workerModal.isOpen,
          onClose: workerModal.closeModal,
          onSubmit: handleWorkerModalSubmit,
          editingWorker: workerModal.data,
        }}
      />

      {/* Modal de éxito */}
      {successModal && (
        <ConfirmModal
          isOpen={!!successModal}
          onClose={closeStatusModals}
          onConfirm={closeStatusModals}
          title="¡Éxito!"
          message={typeof successModal === 'string' ? successModal : 'La operación se completó correctamente.'}
          confirmText="Aceptar"
          variant="info"
        />
      )}

      {/* Modal de error */}
      {errorModal && (
        <ConfirmModal
          isOpen={!!errorModal}
          onClose={closeStatusModals}
          onConfirm={closeStatusModals}
          title="Error"
          message={errorModal}
          confirmText="Cerrar"
          variant="danger"
        />
      )}
    </section>
  );
}