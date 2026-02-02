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

  const handleActivateUser = useCallback(async (id: number) => {
    setLoadingActivate(true);
    try {
      await put(`/user/activate/${id}`, {});
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
              companies={filteredCompanies}
              onActivate={(company) => setConfirmModal({ isOpen: true, user: company, action: 'activate' })}
              onReject={(company) => setConfirmModal({ isOpen: true, user: company, action: 'delete' })}
            />
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
              className="bg-white border-dashed border-gray-300 text-gray-600 hover:border-[#02997d] hover:text-[#02997d]"
              disabled={loadingActivate}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (confirmModal.user) {
                  if (confirmModal.action === 'activate') {
                    handleActivateUser(confirmModal.user.id);
                  } else if (confirmModal.action === 'delete') {
                    handleDeleteUser(confirmModal.user.id);
                  }
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }
              }}
              disabled={loadingActivate}
              className={confirmModal.action === 'activate'
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 shadow-lg min-w-[100px]'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg min-w-[100px]'}
            >
              {confirmModal.action === 'activate' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmModal.action === 'activate' ? 'bg-green-50' : 'bg-red-50'
            }`}>
            {confirmModal.action === 'activate' ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </div>

          <p className="text-gray-600 text-base leading-relaxed mb-6">
            {confirmModal.action === 'activate'
              ? `¿Deseas activar la cuenta de ${confirmModal.user?.company_name}?`
              : `¿Rechazar solicitud de ${confirmModal.user?.company_name}? Esta acción no se puede deshacer.`}
          </p>

          {confirmModal.user && (
            <div className="w-full bg-gray-50 rounded-lg p-5 border border-gray-100 text-base text-left">
              <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 items-center">
                <span className="text-gray-500 font-medium">Nombre:</span>
                <span className="font-semibold text-gray-900">{confirmModal.user.first_name} {confirmModal.user.last_name}</span>
                <span className="text-gray-500 font-medium">Correo:</span>
                <span className="font-medium text-gray-700 truncate" title={confirmModal.user.email}>{confirmModal.user.email}</span>
              </div>
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
