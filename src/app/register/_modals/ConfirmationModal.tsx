'use client';

import React from 'react';
import { RegisterFormData } from '@/lib/validations/auth';
import { PERSONAL_DOCUMENT_TYPES } from '@/constants/documentTypes';
import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { LocationCatalog, Region, District } from '@/hooks/useLocationCatalog';

// Opciones de apps de pago
const PAYMENT_APPS = [
  { label: 'YAPE', value: 'yape' },
  { label: 'PLIN', value: 'plin' },
  { label: 'Lukita', value: 'lukita' },
  { label: 'Agora Pay', value: 'agora' }
];

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: RegisterFormData;
  paymentMethod: 'bank' | 'app' | null;
  catalog: LocationCatalog | null;
  isSubmitting: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  formData,
  paymentMethod,
  catalog,
  isSubmitting
}: ConfirmationModalProps) {
  // Función para obtener datos formateados del resumen
  const getFormattedData = () => {
    // Obtener el nombre de la región desde el catálogo
    const region = catalog?.find((r: Region) => r.id_region === formData.company?.addresses?.[0]?.id_region);

    // Obtener el nombre del distrito desde el catálogo
    let district = null;
    if (formData.company?.addresses?.[0]?.id_district && region) {
      district = region.districts.find((d: District) => d.id_district === formData.company.addresses[0].id_district);
    }

    // Obtener el nombre del sector desde el catálogo
    let sector = null;
    if (formData.company?.addresses?.[0]?.id_sector && district) {
      sector = district.sectors.find(s => s.id_sector === formData.company.addresses[0].id_sector);
    }

    // Obtener el nombre del banco (si es cuenta bancaria)
    const banco = BANCOS.find(b => b.value === formData.company?.bank_accounts?.[0]?.bank);

    // Obtener el tipo de cuenta (si es cuenta bancaria)
    const tipoCuenta = TIPOS_CUENTA.find(t => t.value === formData.company?.bank_accounts?.[0]?.account_type);

    // Obtener el tipo de documento
    const tipoDocumento = PERSONAL_DOCUMENT_TYPES.find(d => d.value === formData.user?.document_type);

    // Obtener la app de pago (si es app)
    const appPago = PAYMENT_APPS.find(a => a.value === formData.company?.payment_apps?.[0]?.app_name);

    return {
      ...formData,
      region_label: region?.region_name,
      district_label: district?.district_name,
      sector_label: sector?.sector_name,
      banco_label: banco?.label,
      tipo_cuenta_label: tipoCuenta?.label,
      tipo_documento_label: tipoDocumento?.label,
      app_pago_label: appPago?.label
    };
  };

  const formattedData = getFormattedData();

  const footerContent = (
    <>
      <Button
        variant="secondary"
        size="lg"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Volver y Editar
      </Button>
      <Button
        variant="primary"
        size="lg"
        onClick={onConfirm}
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="px-8"
      >
        Confirmar y Crear Cuenta
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Registro"
      description="Por favor, revisa que toda la información sea correcta antes de finalizar."
      size="lg"
      footer={footerContent}
      className="max-h-[85vh]"
    >
      <div className="space-y-6">
        {/* Datos Personales */}
        <section className="py-2">
          <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            DATOS DEL REPRESENTANTE
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 py-4 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nombre Completo</p>
              <p className="text-sm font-semibold text-gray-900 break-words capitalize">
                {formattedData.user?.first_name} {formattedData.user?.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Documento</p>
              <p className="text-sm font-semibold text-gray-900 break-words">
                {formattedData.tipo_documento_label} {formattedData.user?.document_number}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Correo Electrónico</p>
              <p className="text-sm font-semibold text-gray-900 break-words">{formattedData.user?.email}</p>
            </div>
          </div>
        </section>

        {/* Datos de la Empresa */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            DATOS DE LA EMPRESA
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 py-4">
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Razón Social</p>
              <p className="text-sm font-semibold text-gray-900 break-words capitalize">{formattedData.company?.company_name}</p>
            </div>
            {formattedData.company?.ruc && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">RUC</p>
                <p className="text-sm font-semibold text-gray-900 break-words">{formattedData.company.ruc}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Teléfono</p>
              <p className="text-sm font-semibold text-gray-900 break-words">
                {formattedData.company?.phones?.[0]}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dirección Fiscal</p>
              <p className="text-sm font-semibold text-gray-900 break-words capitalize">
                {formattedData.company?.addresses?.[0]?.address}
              </p>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {formattedData.district_label}{formattedData.sector_label ? `, ${formattedData.sector_label}` : ''}, {formattedData.region_label}
              </p>
            </div>
          </div>
        </section>

        {/* Método de Pago */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            MÉTODO DE ABONO
          </h4>
          <div className="py-2">
            {paymentMethod === 'bank' ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{formattedData.banco_label}</p>
                    <span className="text-xs text-gray-500">•</span>
                    <p className="text-xs font-medium text-gray-600 uppercase">{formattedData.tipo_cuenta_label}</p>
                  </div>
                  <p className="font-mono text-sm text-gray-600 truncate">
                    {formattedData.company?.bank_accounts?.[0]?.account_number}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-green-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">Billetera Digital</p>
                    <span className="text-xs text-gray-500">•</span>
                    <p className="text-xs font-medium text-gray-600">{formattedData.app_pago_label}</p>
                  </div>
                  <p className="font-mono text-sm text-gray-600">
                    {formattedData.company?.payment_apps?.[0]?.phone_number}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}