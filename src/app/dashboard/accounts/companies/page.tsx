
'use client';

// React
import { useCallback, useEffect, useMemo, useState } from 'react';

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Componentes
import CompaniesFilter from '@/components/filters/CompaniesFilter';
import CompaniesTable from '@/components/tables/CompaniesTable';
// import CompanyModal from '@/components/forms/modals/CompanyModal';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
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
  // const [confirmModal, setConfirmModal] = useState<{
  //   isOpen: boolean;
  //   data: Company | null;
  // }>({ isOpen: false, data: null });
  // const [deleting, setDeleting] = useState(false);

  // --- Hooks ---
  const { get, error: apiError } = useApi<Company[]>();
  // const { get, del, error: apiError } = useApi<Company[]>();

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

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Empresas');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'first_name', width: 30 },
      { header: 'Apellido', key: 'last_name', width: 30 },
      { header: 'Correo electrónico', key: 'email', width: 30 },
      { header: 'Tipo de documento', key: 'document_type', width: 20 },
      { header: 'Número de documento', key: 'document_number', width: 20 },
      { header: 'Estado', key: 'status', width: 10 },
    ];

    filtered.forEach((company) => {
      worksheet.addRow(company);
    });

    // Generar el archivo y descargarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'empresas.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const doc = new jsPDF();
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Nombre', dataKey: 'first_name' },
      { header: 'Apellido', dataKey: 'last_name' },
      { header: 'Correo electrónico', dataKey: 'email' },
      { header: 'Tipo de documento', dataKey: 'document_type' },
      { header: 'Número de documento', dataKey: 'document_number' },
      { header: 'Estado', dataKey: 'status' },
    ];
    const rows = filtered.map((company) => ({
      id: company.id,
      first_name: company.first_name,
      last_name: company.last_name,
      email: company.email,
      document_type: company.document_type,
      document_number: company.document_number,
      status: company.status,
    }));

    autoTable(doc, {
      columns,
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 220, 220] },
      margin: { top: 20 },
      didDrawPage: () => {
        doc.text('Listado de Empresas', 14, 15);
      },
    });
    doc.save('empresas.pdf');
  };

  // const handleDeleteCompany = (company: Company) => { setConfirmModal({ isOpen: true, data: company }); };

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
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="space-y-6">
        {/* Filtros para empresa */}
        <CompaniesFilter
          {...{
            field,
            setField,
            value,
            setValue,
            filterFields,
            onExportExcel: handleExportExcel,
            onExportPdf: handleExportPdf,
          }}
        />

        {/* Loader */}
        {loading && (
          <div className="grid place-items-center py-12">
            <DeliveryLoader message="Cargando empresas..." />
          </div>
        )}

        {/* Error de carga de API */}
        {showApiError && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center text-red-600">
            Error al cargar las empresas: {apiError}
          </div>
        )}

        {/* Tabla y paginación */}
        {!loading && !showApiError && (
          <div className="space-y-4">
            <CompaniesTable
              {...{
                companies: currentItems,
                currentPage,
                onEdit: handleEditCompany,
                onDelete: () => { },
              }}
            />
            {currentItems.length > 0 && (
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
            )}
          </div>
        )}
      </div>

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

      {/* Modal de error */}
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