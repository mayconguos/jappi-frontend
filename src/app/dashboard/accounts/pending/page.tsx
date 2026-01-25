'use client'

import { useEffect, useState, useCallback } from 'react';
import { Mail, Phone, Search, Check, X, Inbox, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { useApi } from '@/hooks/useApi';
import DeliveryLoader from '@/components/ui/delivery-loader';

interface UnverifiedCompany {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  company_name: string;
  phone_number: string;
}

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
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-start gap-4">

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o correo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <DeliveryLoader message="Cargando solicitudes..." />
        </div>
      ) : unverifiedCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No hay solicitudes pendientes</h3>
          <p className="text-gray-500 mt-1 max-w-sm">
            Todas las empresas han sido verificadas. Las nuevas solicitudes aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200 text-left">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Representante</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase shrink-0">
                            {item.company_name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.company_name}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 mt-1">
                              Pendiente
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900">{item.first_name} {item.last_name}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs">
                            <Mail size={12} />
                            {item.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {item.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => setConfirmModal({ isOpen: true, user: item, action: 'delete' })}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            title="Rechazar y Eliminar"
                          >
                            <X size={18} />
                          </Button>
                          <Button
                            onClick={() => setConfirmModal({ isOpen: true, user: item, action: 'activate' })}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full"
                            title="Aprobar Activación"
                          >
                            <Check size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron resultados para &quot;{searchTerm}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading Overlay for Actions */}
      {loadingActivate && (
        <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <DeliveryLoader message="Procesando solicitud..." />
        </div>
      )}

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        size="sm"
        title={confirmModal.action === 'activate' ? 'Aprobar Empresa' : 'Rechazar Solicitud'}
        footer={
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
              className={confirmModal.action === 'activate'
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 shadow-lg'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg'}
            >
              {confirmModal.action === 'activate' ? 'Activar Empresa' : 'Rechazar Solicitud'}
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
              ? `¿Se desea activar la cuenta de ${confirmModal.user?.company_name}?`
              : `¿Se desea rechazar y eliminar la solicitud de ${confirmModal.user?.company_name}? Esta acción no se puede deshacer.`}
          </p>

          {confirmModal.user && (
            <div className="w-full bg-gray-50 rounded-lg p-5 border border-gray-100 text-base">
              <div className="grid grid-cols-[1fr,2fr] gap-x-6 gap-y-3 items-center">
                <span className="text-gray-500 text-left font-medium">Nombre:</span>
                <span className="font-semibold text-gray-900 text-left">{confirmModal.user.first_name} {confirmModal.user.last_name}</span>
                <span className="text-gray-500 text-left font-medium">Correo:</span>
                <span className="font-semibold text-gray-900 text-left truncate" title={confirmModal.user.email}>{confirmModal.user.email}</span>
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
