import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Building2, User, Phone, MapPin, CreditCard, Wallet, Mail, FileText } from 'lucide-react';
import { CompanyDetail } from '@/app/dashboard/accounts/companies/page';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CompanyDetail | null;
  loading: boolean;
}

export default function CompanyDetailsModal({
  isOpen,
  onClose,
  data,
  loading
}: CompanyDetailsModalProps) {

  // Format helpers
  const getDocumentType = (type: string) => {
    return type === '1' ? 'DNI' : type === '6' ? 'RUC' : 'Doc';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de la Empresa"
      size="xl"
      footer={
        <ModalFooter className="justify-end">
          <Button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-5 py-2.5 shadow-sm transition-colors"
          >
            Cerrar
          </Button>
        </ModalFooter>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !data ? (
        <div className="text-center py-12 text-gray-500">
          <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p>No se encontró información de la empresa.</p>
        </div>
      ) : (
        <div>

          {/* Header Summary Section */}
          <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex items-start gap-5 mb-2">
            <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 shrink-0">
              <Building2 size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize tracking-tight">{data.company.company_name.toLowerCase()}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-inset ring-blue-700/10">
                  RUC: {data.company.ruc}
                </span>
              </div>
            </div>
          </div>

          {/* Representante */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Información del Representante
            </h3>
            <div className="border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2 font-medium capitalize">{data.user.first_name.toLowerCase()} {data.user.last_name.toLowerCase()}</dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  <dt className="text-sm font-medium text-gray-500">Documento</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2 font-medium">{getDocumentType(data.user.document_type)}: {data.user.document_number}</dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2 font-medium break-all">{data.user.email}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Contacto */}
          <div className="mt-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 mt-6">
              Información de Contacto
            </h3>
            <div className="border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 items-center">
                  <dt className="text-sm font-medium text-gray-500">Teléfonos</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2 font-medium">
                    {data.company.phones.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.company.phones.map((phone, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/10">
                            {phone}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 italic">No registrado</span>}
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  <dt className="text-sm font-medium text-gray-500">Direcciones</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2 font-medium">
                    {data.company.addresses.length > 0 ? (
                      <ul className="space-y-3">
                        {data.company.addresses.map((addr) => (
                          <li key={addr.id} className="flex items-start gap-2.5">
                            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <span className="capitalize leading-snug">{addr.address.toLowerCase()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-gray-400 italic">No registrado</span>}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Billeteras */}
          <div className="mt-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 mt-6">
              Billeteras Digitales
            </h3>
            <div className="border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                {data.company.payment_apps.length > 0 ? (
                  data.company.payment_apps.map((app) => (
                    <div key={app.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 items-center">
                      <dt className="text-sm font-medium text-gray-500 capitalize">{app.app_name.toLowerCase()}</dt>
                      <dd className="text-sm text-gray-900 sm:col-span-2 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-pink-50 flex items-center justify-center text-pink-600 font-bold text-[10px] uppercase shrink-0 border border-pink-100">
                            {app.app_name.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{app.phone_number}</span>
                            {app.account_holder && (
                              <span className="text-xs text-gray-500 capitalize">{app.account_holder.toLowerCase()}</span>
                            )}
                          </div>
                        </div>
                      </dd>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-sm text-gray-400 italic">No hay billeteras registradas.</div>
                )}
              </dl>
            </div>
          </div>

        </div>
      )}
    </Modal>
  );
}
