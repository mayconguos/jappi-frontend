'use client'

import { useEffect, useState, useCallback } from 'react';
import { Building, Mail, Phone, User } from 'lucide-react';

import Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
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
  const { get, put } = useApi<UnverifiedCompany[]>();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: UnverifiedCompany | null;
    action: 'activate' | 'delete';
  }>({ isOpen: false, user: null, action: 'activate' });
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Estado para el loader
  const [loadingActivate, setLoadingActivate] = useState(false); // Estado para el loader al activar compañías

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
    setLoading(true); // Mostrar loader al cargar compañías
    fetchUnverifiedCompanies().finally(() => setLoading(false)); // Ocultar loader al finalizar
  }, [fetchUnverifiedCompanies]);

  const handleActivateUser = useCallback(async (id: number) => {
    setLoadingActivate(true); // Mostrar loader
    try {
      await put(`/user/activate/${id}`, {});
      setUnverifiedCompanies((prev) => prev.filter((user) => user.id !== id));
      setSuccessModal(`El usuario ha sido activado.`);
    } catch {
      setErrorModal('Hubo un error al activar el usuario.');
    } finally {
      setLoadingActivate(false); // Ocultar loader
    }
  }, [put]);

  return (
    <section className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {unverifiedCompanies.map((user) => (
          <Card
            key={user.id}
            description={
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-6 h-6 text-[var(--surface-dark)] flex-shrink-0 self-start" />
                  <p className="text-md text-gray-700">{user.first_name} {user.last_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-6 h-6 text-[var(--surface-dark)] flex-shrink-0 self-start" />
                  <p className="text-md text-gray-700">{user.company_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-6 h-6 text-[var(--surface-dark)] flex-shrink-0 self-start" />
                  <p className="text-md text-gray-700">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-6 h-6 text-[var(--surface-dark)] flex-shrink-0 self-start" />
                  <p className="text-md text-gray-700">{user.phone_number}</p>
                </div>
              </div>
            }
            footer={
              <div className="flex justify-end gap-2">
                <Button
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                  onClick={() =>
                    setConfirmModal({ isOpen: true, user, action: 'delete' })
                  }
                >
                  Eliminar
                </Button>
                <Button
                  className="bg-primary text-white disabled:opacity-50"
                  onClick={() =>
                    setConfirmModal({ isOpen: true, user, action: 'activate' })
                  }
                >
                  Activar
                </Button>
              </div>
            }
            className="flex flex-col justify-between h-full transform transition-transform duration-200 hover:scale-105"
          />
        ))}
      </div>

      {/* Loader para compañías no verificadas */}
      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando compañías no verificadas..." />
        </div>
      )}

      {/* Loader para activación de compañía */}
      {loadingActivate && (
        <div className="text-center py-4">
          <DeliveryLoader message="Activando compañía..." />
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmModal.isOpen && confirmModal.user && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, user: null, action: 'activate' })}
          onConfirm={() => {
            if (confirmModal.user) {
              handleActivateUser(confirmModal.user.id);
            }
          }}
          title={
            confirmModal.action === 'activate'
              ? 'Confirmar Activación'
              : 'Confirmar Eliminación'
          }
          message={`¿Estás seguro de que deseas ${
            confirmModal.action === 'activate' ? 'activar' : 'eliminar'
          } a ${
            `${confirmModal.user?.first_name} ${confirmModal.user?.last_name || ''}`.trim()
          }?`}
          confirmText={confirmModal.action === 'activate' ? 'Activar' : 'Eliminar'}
          variant={confirmModal.action === 'activate' ? 'info' : 'danger'}
        />
      )}

      {/* Modal de éxito */}
      {successModal && (
        <ConfirmModal
          isOpen={!!successModal}
          onClose={() => setSuccessModal(null)}
          onConfirm={() => setSuccessModal(null)}
          title="¡Éxito!"
          message={successModal}
          confirmText="Aceptar"
          variant="info"
        />
      )}

      {/* Modal de error */}
      {errorModal && (
        <ConfirmModal
          isOpen={!!errorModal}
          onClose={() => setErrorModal(null)}
          onConfirm={() => setErrorModal(null)}
          title="Error"
          message={errorModal}
          confirmText="Cerrar"
          variant="danger"
        />
      )}
    </section>
  );
}
