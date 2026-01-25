
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

// Componentes
import WorkersFilter from '@/components/filters/WorkersFilter';
import WorkersTable from '@/components/tables/WorkersTable';
import WorkerModal from '@/components/forms/modals/WorkerModal';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
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
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

      <div className="space-y-6">
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
          <div className="grid place-items-center py-12">
            <DeliveryLoader message="Cargando usuarios..." />
          </div>
        )}

        {/* Error de carga de API */}
        {showApiError && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center text-red-600">
            Error al cargar los trabajadores: {apiError}
          </div>
        )}

        {/* Sin datos */}
        {!loading && !showApiError && filtered.length === 0 && (
          <div className="p-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-gray-500">
            <p>No hay trabajadores disponibles en este momento.</p>
          </div>
        )}

        {/* Tabla y paginación */}
        {!loading && !showApiError && filtered.length > 0 && (
          <div className="space-y-4">
            <WorkersTable
              {...{
                workers: currentItems,
                currentPage,
                onEdit: handleEditWorker,
                onDelete: handleDeleteWorker,
              }}
            />
            <div className="w-full pt-4">
              <Pagination
                {...{
                  currentPage,
                  totalItems,
                  itemsPerPage: ITEMS_PER_PAGE,
                  onPageChange: handlePageChange,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirmación para eliminar */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={deleting ? () => { } : closeConfirmModal}
        size="sm"
        title={deleting ? "Eliminando usuario..." : "Confirmar eliminación"}
        footer={
          <ModalFooter>
            {!deleting && (
              <Button
                variant="outline"
                onClick={closeConfirmModal}
                className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            )}
            <Button
              onClick={confirmDeleteWorker}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg min-w-[100px]"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50">
            {deleting ? (
              <DeliveryLoader size="sm" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <p className="text-gray-600 text-base leading-relaxed">
            {deleting
              ? "Por favor, espera un momento mientras procesamos la solicitud."
              : `¿Estás seguro de que deseas eliminar a ${confirmModal.data?.first_name} ${confirmModal.data?.last_name}? Esta acción no se puede deshacer.`}
          </p>
        </div>
      </Modal>

      {/* Modales de estado */}
      <WorkerModal
        {...{
          isOpen: workerModal.isOpen,
          onClose: workerModal.closeModal,
          onSubmit: handleWorkerModalSubmit,
          editingWorker: workerModal.data,
        }}
      />

      {successModal && (
        <Modal
          isOpen={!!successModal}
          onClose={closeStatusModals}
          size="sm"
          title="¡Éxito!"
          footer={
            <ModalFooter className="justify-center">
              <Button
                onClick={closeStatusModals}
                className="bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 shadow-lg w-full sm:w-auto min-w-[100px]"
              >
                Aceptar
              </Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-gray-600 text-base font-medium">
              {typeof successModal === 'string' ? successModal : 'La operación se completó correctamente.'}
            </p>
          </div>
        </Modal>
      )}

      {errorModal && (
        <Modal
          isOpen={!!errorModal}
          onClose={closeStatusModals}
          size="sm"
          title="Error"
          footer={
            <ModalFooter className="justify-center">
              <Button
                onClick={closeStatusModals}
                className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg w-full sm:w-auto min-w-[100px]"
              >
                Cerrar
              </Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-600 text-base font-medium">{errorModal}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}