'use client'

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { useApi } from '@/hooks/useApi';
import DeliveryLoader from '@/components/ui/delivery-loader';

// Components
import PendingFilter from '@/components/filters/PendingFilter';
import PendingTable, { UnverifiedCompany } from '@/components/tables/PendingTable';
import { Pagination } from '@/components/ui/pagination';

export default function ActivationsPage() {
  const [unverifiedCompanies, setUnverifiedCompanies] = useState<UnverifiedCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { get, put, del } = useApi<UnverifiedCompany[]>();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: UnverifiedCompany | null;
    action: 'activate' | 'delete';
  }>({ isOpen: false, user: null, action: 'activate' });

  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingActivate, setLoadingActivate] = useState(false);
  const [isCorporateVal, setIsCorporateVal] = useState(false);

  const fetchUnverifiedCompanies = useCallback(async () => {
    const response = await get('/user?status=unverified&type=companies');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setUnverifiedCompanies(data);
    } else {
      setUnverifiedCompanies([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true);
    fetchUnverifiedCompanies().finally(() => setLoading(false));
  }, [fetchUnverifiedCompanies]);

  const handleActivateUser = useCallback(async (id: number, isCorporate: boolean) => {
    setLoadingActivate(true);
    try {
      await put(`/user/activate/${id}`, { is_corporate: isCorporate });
      setUnverifiedCompanies((prev) => prev.filter((user) => user.id !== id));
      setSuccessModal(`La empresa ha sido activada correctamente.`);
    } catch {
      setErrorModal('Hubo un error al activar la cuenta.');
    } finally {
      setLoadingActivate(false);
    }
  }, [put]);

  const handleDeleteUser = useCallback(async (id: number) => {
    setLoadingActivate(true);
    try {
      await del(`/user/unverified/${id}`, {});
      setUnverifiedCompanies((prev) => prev.filter((user) => user.id !== id));
      setSuccessModal(`La solicitud ha sido rechazada y eliminada.`);
    } catch {
      setErrorModal('Hubo un error al eliminar la cuenta.');
    } finally {
      setLoadingActivate(false);
    }
  }, [del]);

  // Filter Logic
  const filteredCompanies = (unverifiedCompanies || []).filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredCompanies.length;
  const currentItems = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      <div className="space-y-6">
        {/* Search and Filters */}
        <PendingFilter
          value={searchTerm}
          setValue={setSearchTerm}
          totalItems={filteredCompanies.length}
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando solicitudes..." />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p>No se encontraron solicitudes pendientes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <PendingTable
              companies={currentItems}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onActivate={(company) => {
                setIsCorporateVal(company.is_corporate ?? false);
                setConfirmModal({ isOpen: true, user: company, action: 'activate' });
              }}
              onReject={(company) => setConfirmModal({ isOpen: true, user: company, action: 'delete' })}
            />
            {totalItems > 0 && (
              <div className="flex justify-center sm:justify-end mt-4">
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

      {/* Loading Overlay for Actions */}
      {loadingActivate && (
        <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <DeliveryLoader message="Procesando solicitud..." />
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => !loadingActivate && setConfirmModal({ ...confirmModal, isOpen: false })}
        size="sm"
        title={confirmModal.action === 'activate' ? 'Aprobar Empresa' : 'Rechazar Solicitud'}
        footer={
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              disabled={loadingActivate}
            >
              Cancelar
            </Button>
            <Button
              variant={confirmModal.action === 'activate' ? 'primary' : 'destructive'}
              onClick={() => {
                if (confirmModal.user) {
                  if (confirmModal.action === 'activate') {
                    handleActivateUser(confirmModal.user.id, isCorporateVal);
                  } else if (confirmModal.action === 'delete') {
                    handleDeleteUser(confirmModal.user.id);
                  }
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }
              }}
              disabled={loadingActivate}
              className="min-w-[100px]"
            >
              {confirmModal.action === 'activate' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center">

          {confirmModal.user && (
            <div className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] text-left">
              
              {/* Profile Card Info */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase ring-1 ring-indigo-100/50 shrink-0">
                  {confirmModal.user.company_name.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{confirmModal.user.company_name}</p>
                  <p className="text-xs text-gray-500 truncate">{confirmModal.user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Representante</span>
                  <span className="block text-xs font-medium text-gray-800">{confirmModal.user.first_name} {confirmModal.user.last_name || ''}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Teléfono</span>
                  <span className="block text-xs font-mono text-gray-800">{confirmModal.user.phone_number}</span>
                </div>
              </div>
              
              {confirmModal.action === 'activate' && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Tarjeta Estándar */}
                    <div 
                      onClick={() => setIsCorporateVal(false)}
                      className={`relative cursor-pointer rounded-xl border p-3 transition-all duration-200 ${
                        !isCorporateVal 
                          ? 'border-[#02997d] bg-[#02997d]/[0.03] ring-1 ring-[#02997d]' 
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${
                          !isCorporateVal ? 'border-[#02997d] bg-[#02997d]' : 'border-gray-300 bg-white'
                        }`}>
                          {!isCorporateVal && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-[12px] font-bold ${!isCorporateVal ? 'text-[#02997d]' : 'text-gray-700'}`}>
                          Estándar
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 pl-6 leading-tight">
                        Respeta las tarifas base.
                      </p>
                    </div>

                    {/* Tarjeta Corporativo */}
                    <div 
                      onClick={() => setIsCorporateVal(true)}
                      className={`relative cursor-pointer rounded-xl border p-3 transition-all duration-200 ${
                        isCorporateVal 
                          ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${
                          isCorporateVal ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'
                        }`}>
                          {isCorporateVal && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-[12px] font-bold ${isCorporateVal ? 'text-indigo-700' : 'text-gray-700'}`}>
                          Corporativo
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 pl-6 leading-tight">
                        Acceso a ajustes y tarifas preferenciales.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        size="sm"
        title="¡Operación Exitosa!"
        footer={
          <ModalFooter className="justify-center">
            <Button
              onClick={() => setSuccessModal(null)}
              className="bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 shadow-lg w-full sm:w-auto min-w-[100px]"
            >
              Entendido
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-green-50">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-base font-medium">{successModal}</p>
        </div>
      </Modal>

      {/* Modal de Error */}
      <Modal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        size="sm"
        title="Error"
        footer={
          <ModalFooter className="justify-center">
            <Button
              onClick={() => setErrorModal(null)}
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
    </div>
  );
}
