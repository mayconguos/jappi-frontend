
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';

// Componentes
import CarriersFilter from '@/components/filters/CarriersFilter';
import CarriersTable from '@/components/tables/CarriersTable';
import CarrierModal from '@/components/forms/modals/CarrierModal';
import CarrierViewModal from '@/components/forms/modals/CarrierViewModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Pagination } from '@/components/ui/pagination';
// Hooks personalizados
import { useApi, useModal } from '@/hooks';


// --- Tipos --- 
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


// --- Constantes ---
const ITEMS_PER_PAGE = 10;
const filterFields = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];


export default function CarriersPage() {
  // --- State ---
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    data: Carrier | null;
  }>({ isOpen: false, data: null });
  const [deleting, setDeleting] = useState(false);

  // --- Hooks ---
  const { get, del, error: apiError } = useApi<Carrier[]>();
  const carrierModal = useModal<Carrier>();
  const carrierViewModal = useModal<Carrier>();

  // --- Effects ---
  // Resetear paginación al cambiar filtro o valor
  useEffect(() => {
    setCurrentPage(1);
  }, [field, value]);

  // --- Data Fetching ---
  const fetchCarriers = useCallback(async () => {
    const response = await get('/user?type=couriers');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setCarriers(data);
    } else {
      setCarriers([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true);
    fetchCarriers().finally(() => setLoading(false));
  }, [fetchCarriers]);

  // Mostrar error de carga de API si ocurre
  const showApiError = !loading && apiError && carriers.length === 0;

  // --- Derived Data ---
  const filtered = useMemo(() => {
    if (!field) return carriers;
    const val = value.toLowerCase();
    return carriers.filter((carrier) => {
      const fieldValue = carrier[field as keyof Carrier];
      return fieldValue ? fieldValue.toString().toLowerCase().includes(val) : false;
    });
  }, [carriers, field, value]);

  const totalItems = filtered.length;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Handlers ---
  const handlePageChange: (page: number) => void = (page) => setCurrentPage(page);

  const handleDeleteCarrier: (carrier: Carrier) => void = (carrier) => setConfirmModal({ isOpen: true, data: carrier });

  const handleViewCarrier: (carrier: Carrier) => void = (carrier) => {
    carrierViewModal.openModal(carrier);
  };

  const handleEditCarrier: (carrier: Carrier) => void = (carrier) => carrierModal.openModal(carrier);

  const handleAddCarrier: () => void = () => {
    carrierModal.openModal();
  };

  const handleCarrierSubmit: (carrier: Omit<Carrier, 'id'>, editingCarrier?: Carrier | null) => void = (carrier, editingCarrier) => {
    if (editingCarrier) {
      const updatedCarrier = { ...editingCarrier, ...carrier, id: editingCarrier.id };
      setCarriers(prev => prev.map(c => c.id === updatedCarrier.id ? updatedCarrier : c));
    } else {
      const carrierWithId = { ...carrier, id: Date.now() };
      setCarriers(prev => [...prev, carrierWithId]);
    }
  };

  const handleCarrierModalSubmit = async (carrier: Omit<Carrier, 'id'>) => {
    try {
      const isEditing = !!carrierModal.data;
      await handleCarrierSubmit(carrier, carrierModal.data);
      setSuccessModal(isEditing ? 'El transportista ha sido actualizado correctamente.' : 'El transportista ha sido creado correctamente.');
    } catch {
      setErrorModal('Hubo un error al procesar la solicitud.');
    } finally {
      carrierModal.closeModal();
    }
  };

  const confirmDeleteCarrier = async () => {
    if (confirmModal.data) {
      setDeleting(true);
      const carrierId = confirmModal.data.id;
      const response = await del(`/user/${carrierId}`);
      setDeleting(false);
      closeConfirmModal();
      if (response !== null) {
        setCarriers(prev => prev.filter(c => c.id !== carrierId));
        setSuccessModal('El transportista ha sido eliminado correctamente.');
      } else {
        setErrorModal('No se pudo eliminar el transportista.');
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
      {/* Filtros carrier */}
      <CarriersFilter
        {...{
          field,
          setField,
          value,
          setValue,
          filterFields,
          onAdd: handleAddCarrier,
        }}
      />

      {/* Loader */}
      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando transportistas..." />
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
          No hay transportistas disponibles.
        </div>
      )}

      {/* Tabla y paginación */}
      {!loading && (
        <>
          <CarriersTable
            {...{
              carriers: currentItems,
              currentPage,
              onView: handleViewCarrier,
              onEdit: handleEditCarrier,
              onDelete: handleDeleteCarrier,
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
            onConfirm={deleting ? () => { } : confirmDeleteCarrier}
            title={deleting ? "Eliminando transportista..." : "Confirmar eliminación"}
            message={
              deleting
                ? "Eliminando transportista..."
                : `¿Estás seguro de que deseas eliminar a ${confirmModal.data?.first_name} ${confirmModal.data?.last_name}?`
            }
            confirmText={deleting ? "Eliminando..." : "Eliminar"}
            variant="danger"
          />
          {deleting && (
            <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 z-50">
              <div className="bg-white rounded-lg p-16 shadow-lg flex flex-col items-center">
                <DeliveryLoader message="Eliminando transportista..." />
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal para añadir o editar usuario */}
      <CarrierModal
        {...{
          isOpen: carrierModal.isOpen,
          onClose: carrierModal.closeModal,
          onSubmit: handleCarrierModalSubmit,
          editingCarrier: carrierModal.data,
        }}
      />

      {/* Modal para ver detalles del transportista */}
      <CarrierViewModal
        isOpen={carrierViewModal.isOpen}
        onClose={carrierViewModal.closeModal}
        carrier={carrierViewModal.data}
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
