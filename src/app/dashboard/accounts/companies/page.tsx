
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';

import CompaniesFilter from '@/components/filters/CompaniesFilter';
import CompaniesTable from '@/components/tables/CompaniesTable';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Pagination } from '@/components/ui/pagination';
import CompanyDetailsModal from '@/components/forms/modals/CompanyDetailsModal';

import { useApi, useModal } from '@/hooks';

export interface Company {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  address: string;
  phone_number: string;
  status: number;
}

export interface CompanyDetail {
  user: {
    first_name: string;
    last_name: string;
    document_type: string;
    document_number: string;
    email: string;
  };
  company: {
    company_name: string;
    ruc: string;
    bank_accounts: any[];
    phones: string[];
    payment_apps: {
      id: number;
      phone_number: string;
      payment_app: number;
      app_name: string;
      account_holder: string;
      document_number: string;
    }[];
    addresses: {
      id: number;
      address: string;
      id_region: number;
      id_district: number;
      id_sector: number;
    }[];
  };
}

// --- Constants ---
const ITEMS_PER_PAGE = 10;
const FILTER_FIELDS = [
  { value: 'company_name', label: 'Empresa' },
  { value: 'first_name', label: 'Nombre Contacto' },
  { value: 'last_name', label: 'Apellido Contacto' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function CompaniesPage() {
  // --- State ---
  const [companies, setCompanies] = useState<Company[]>([]);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // Start loading true

  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const [companyDetail, setCompanyDetail] = useState<CompanyDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  /* Soft Delete State */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const { get, put, error: apiError } = useApi<Company[]>();

  const { get: getDetail } = useApi<CompanyDetail>();

  const companyModal = useModal<Company>();


  const fetchCompanies = useCallback(async () => {
    try {
      const response = await get('/user?type=companies');
      if (response && Array.isArray(response)) {
        setCompanies(response);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Failed to fetch companies", err);
      // Optional: setErrorModal('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [field, value]);

  const filteredCompanies = useMemo(() => {
    if (!field || !value) return companies;

    const searchTerm = value.toLowerCase();
    return companies.filter((company) => {
      const fieldValue = company[field as keyof Company];
      return fieldValue
        ? String(fieldValue).toLowerCase().includes(searchTerm)
        : false;
    });
  }, [companies, field, value]);

  const totalItems = filteredCompanies.length;
  const currentItems = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Empresas');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Empresa', key: 'company_name', width: 30 },
      { header: 'Contacto (Nombre)', key: 'first_name', width: 20 },
      { header: 'Contacto (Apellido)', key: 'last_name', width: 20 },
      { header: 'Correo electrónico', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'phone_number', width: 20 },
      { header: 'Dirección', key: 'address', width: 40 },
      { header: 'Estado', key: 'status', width: 10 },
    ];

    filteredCompanies.forEach((company) => worksheet.addRow(company));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `empresas_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Empresa', dataKey: 'company_name' },
      { header: 'Contacto', dataKey: 'full_name' },
      { header: 'Correo', dataKey: 'email' },
      { header: 'Teléfono', dataKey: 'phone_number' },
    ];

    const rows = filteredCompanies.map((c) => ({
      ...c,
      full_name: `${c.first_name} ${c.last_name}`
    }));

    autoTable(doc, {
      columns,
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [71, 85, 105] },
      margin: { top: 20 },
      didDrawPage: () => {
        doc.text('Reporte de Empresas', 14, 15);
      },
    });
    doc.save(`empresas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const closeStatusModals = () => {
    setSuccessModal(false);
    setErrorModal(null);
  };

  const handleViewCompany = async (company: Company) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setCompanyDetail(null);
    try {
      // Endpoint logic: /user/company/detail/:id
      const response = await getDetail(`/user/company/detail/${company.id}`);
      if (response) {
        setCompanyDetail(response);
      }
    } catch (error) {
      console.error("Error details", error);
      // Optional toast
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      // Call API to soft delete (status: 2)
      const response = await put(`/user/update/${companyToDelete.id}`, { status: 2 });

      // If successful (response is usually the updated object or just truthy)
      if (response) {
        // Update local state to remove the deleted company
        setCompanies(prev => prev.filter(c => c.id !== companyToDelete.id));
        setSuccessModal('La empresa ha sido eliminada correctamente.');
        setDeleteModalOpen(false);
        setCompanyToDelete(null);
      } else {
        setErrorModal('No se pudo eliminar la empresa. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error("Delete error", error);
      setErrorModal('Ocurrió un error al intentar eliminar la empresa.');
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      <div className="space-y-6">
        <CompaniesFilter
          field={field}
          setField={setField}
          value={value}
          setValue={setValue}
          filterFields={FILTER_FIELDS}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          totalItems={totalItems}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando empresas..." />
          </div>
        ) : apiError && companies.length === 0 ? (
          <div className="p-8 rounded-xl border border-red-100 bg-red-50 text-center text-red-600 flex flex-col items-center gap-2">
            <AlertTriangle size={32} />
            <p className="font-medium">Error al cargar datos: {apiError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <CompaniesTable
              companies={currentItems}
              currentPage={currentPage}
              onView={handleViewCompany}
              onDelete={handleDeleteClick}
            />

            {totalItems > 0 && (
              <div className="pt-4 flex justify-center sm:justify-end">
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
      </div>

      {/* --- Modals --- */}

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

      {/* Error Modal */}
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

      {/* Details Modal */}
      <CompanyDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={companyDetail}
        loading={detailLoading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        size="sm"
        title="Confirmar Eliminación"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-slate-600 font-medium mb-1">
            ¿Estás seguro que deseas eliminar la empresa <span className="font-bold text-slate-900">"{companyToDelete?.company_name}"</span>?
          </p>
          <p className="text-sm text-slate-400">
            Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>
    </div>
  );
}