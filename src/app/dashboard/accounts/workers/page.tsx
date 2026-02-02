
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
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
    try {
      const response = await get('/user?type=workers');
      if (response && Array.isArray(response)) {
        setWorkers(response);
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error("Failed to fetch workers", err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // --- Derived Data ---
  const filtered = useMemo(() => {
    if (!field || !value) return workers; // Optimized check
    const val = value.toLowerCase();

    // Safety check if field is valid key
    if (!field) return workers;

    return workers.filter((worker) => {
      const fieldValue = worker[field as keyof Worker];
      return fieldValue ? fieldValue.toString().toLowerCase().includes(val) : false;
    });
  }, [workers, field, value]);

  const totalItems = filtered.length;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Handlers ---
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleDeleteWorker = (worker: Worker) => setConfirmModal({ isOpen: true, data: worker });

  const handleEditWorker = (worker: Worker) => workerModal.openModal(worker);

  const handleAddWorker = () => {
    workerModal.openModal();
  };

  const handleWorkerSubmit = (worker: Omit<Worker, 'id'>, editingWorker?: Worker | null) => {
    if (editingWorker) {
      const updatedWorker = { ...editingWorker, ...worker, id: editingWorker.id };
      setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
    } else {
      const workerWithId = { ...worker, id: Date.now() }; // Mock ID generation
      setWorkers(prev => [...prev, workerWithId as Worker]);
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
      try {
        const response = await del(`/user/${workerId}`);
        // Adjust based on your API response for success (CompaniesPage checks response truthiness)
        if (response !== null) {
          setWorkers(prev => prev.filter(w => w.id !== workerId));
          setSuccessModal('El usuario ha sido eliminado correctamente.');
          setConfirmModal({ isOpen: false, data: null });
        } else {
          setErrorModal('No se pudo eliminar el usuario.');
        }
      } catch (e) {
        setErrorModal('Ocurrió un error al intentar eliminar el usuario.');
      } finally {
        setDeleting(false);
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
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      <div className="space-y-6">
        {/* Filtros y botón para añadir worker */}
        <WorkersFilter
          field={field}
          setField={setField}
          value={value}
          setValue={setValue}
          filterFields={filterFields}
          onAdd={handleAddWorker}
          totalItems={totalItems}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando usuarios..." />
          </div>
        ) : apiError && workers.length === 0 ? (
          <div className="p-8 rounded-xl border border-red-100 bg-red-50 text-center text-red-600 flex flex-col items-center gap-2">
            <AlertTriangle size={32} />
            <p className="font-medium">Error al cargar usuarios: {apiError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <WorkersTable
              workers={currentItems}
              currentPage={currentPage}
              onEdit={handleEditWorker}
              onDelete={handleDeleteWorker}
            />
            {totalItems > 0 && (
              <div className="pt-4 flex justify-center sm:justify-end">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmación para eliminar */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={deleting ? () => { } : closeConfirmModal}
        size="sm"
        title="Confirmar Eliminación"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={closeConfirmModal}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteWorker}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-slate-600 font-medium mb-1">
            ¿Estás seguro de que deseas eliminar a <span className="font-bold text-slate-900">"{confirmModal.data?.first_name} {confirmModal.data?.last_name}"</span>?
          </p>
          <p className="text-sm text-slate-400">
            Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>

      {/* Worker Modal */}
      <WorkerModal
        isOpen={workerModal.isOpen}
        onClose={workerModal.closeModal}
        onSubmit={handleWorkerModalSubmit}
        editingWorker={workerModal.data}
      />

      {/* Success Modal */}
      {successModal && (
        <Modal
          isOpen={!!successModal}
          onClose={closeStatusModals}
          size="sm"
          title="Operación Exitosa"
          footer={
            <ModalFooter className="justify-center">
              <Button onClick={closeStatusModals} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
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
              {typeof successModal === 'string' ? successModal : 'Operación completada correctamente.'}
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
              <Button onClick={closeStatusModals} className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                Cerrar
              </Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-slate-600 font-medium">{errorModal}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}