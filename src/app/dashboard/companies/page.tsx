
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';

// Componentes
import CompaniesFilter from '@/components/filters/CompaniesFilter';
import CompaniesTable from '@/components/tables/CompaniesTable';
// import CompanyModal from '@/components/forms/modals/CompanyModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Pagination } from '@/components/ui/pagination';
// Hooks personalizados
import { useApi, useModal } from '@/hooks';


// --- Tipos ---
export interface Company {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  document_type: string;
  document_number: string;
  status: number;
}

// --- Constantes ---
const ITEMS_PER_PAGE = 10;
const filterFields = [
  { value: '', label: '-- Seleccionar --' },
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function CompaniesPage() {
  // --- State ---
  const [companies, setCompanies] = useState<Company[]>([]);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    data: Company | null;
  }>({ isOpen: false, data: null });
  const [deleting, setDeleting] = useState(false);

  // --- Hooks ---
  const { get, del, error: apiError } = useApi<Company[]>();
  const companyModal = useModal<Company>();

  // --- Effects ---
  // Resetear paginación al cambiar filtro o valor
  useEffect(() => {
    setCurrentPage(1);
  }, [field, value]);

  // --- Data Fetching ---
  const fetchCompanies = useCallback(async () => {
    const response = await get('/user?type=companies');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setCompanies(data);
    } else {
      setCompanies([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true);
    fetchCompanies().finally(() => { setLoading(false); });
  }, [fetchCompanies]);

  // Mostrar error de carga de API si ocurre
  const showApiError = !loading && apiError && companies.length === 0;

  // --- Derived Data ---
  const filtered = useMemo(() => {
    if (!field) return companies;
    const val = value.toLowerCase();
    return companies.filter((company) => {
      const fieldValue = company[field as keyof Company];
      return fieldValue ? fieldValue.toString().toLowerCase().includes(val) : false;
    });
  }, [companies, field, value]);

  const totalItems = filtered.length;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Handlers ---
  const handlePageChange = (page: number) => { setCurrentPage(page); };

  const handleDeleteCompany = (company: Company) => { setConfirmModal({ isOpen: true, data: company }); };

  const handleEditCompany: (company: Company) => void = (company) => companyModal.openModal(company);

  // const confirmDeleteCompany = async () => {
  //   if (confirmModal.data) {
  //     setDeleting(true);
  //     const companyId = confirmModal.data.id;
  //     const response = await del(`/user/${companyId}`);
  //     setDeleting(false);
  //     closeConfirmModal();
  //     if (response !== null) {
  //       setCompanies(prev => prev.filter(c => c.id !== companyId));
  //       setSuccessModal('La empresa ha sido eliminada correctamente.');
  //     } else {
  //       setErrorModal('No se pudo eliminar la empresa.');
  //     }
  //   }
  // };

  // const closeConfirmModal = () => { setConfirmModal({ isOpen: false, data: null }); };

  const closeStatusModals = () => {
    setSuccessModal(false);
    setErrorModal(null);
  };

  // --- Render ---
  return (
    <section className="p-6 space-y-6">
      {/* Filtros para empresa */}
      <CompaniesFilter
        {...{
          field,
          setField,
          value,
          setValue,
          filterFields,
        }}
      />

      {/* Loader */}
      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando empresas..." />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay clientes disponibles.
        </div>
      )}

      {/* Error de carga de API */}
      {showApiError && (
        <div className="text-center py-4 text-red-500">
          Error al cargar las empresas: {apiError}
        </div>
      )}

      {/* Sin datos */}
      {!loading && !showApiError && filtered.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay empresas disponibles.
        </div>
      )}

      {/* Tabla y paginación */}
      {!loading && (
        <>
          <CompaniesTable
            {...{
              companies: currentItems,
              currentPage,
              onEdit: handleEditCompany,
              onDelete: handleDeleteCompany,
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
          {/* <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={deleting ? () => { } : closeConfirmModal}
            onConfirm={deleting ? () => { } : confirmDeleteCompany}
            title={deleting ? "Eliminando empresa..." : "Confirmar eliminación"}
            message={
              deleting
                ? "Eliminando empresa..."
                : `¿Estás seguro de que deseas eliminar a ${confirmModal.data?.first_name} ${confirmModal.data?.last_name}?`
            }
            confirmText={deleting ? "Eliminando..." : "Eliminar"}
            variant="danger"
          /> */}
          {deleting && (
            <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 z-50">
              <div className="bg-white rounded-lg p-16 shadow-lg flex flex-col items-center">
                <DeliveryLoader message="Eliminando empresa..." />
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal para editar empresa */}
      {/* <CompanyModal
        {...{
          isOpen: companyModal.isOpen,
          onClose: companyModal.closeModal,
          onSubmit: handleCompanyModalSubmit,
          editingCompany: companyModal.data,
        }}
      /> */}

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