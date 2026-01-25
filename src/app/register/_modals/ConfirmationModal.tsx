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
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Volver y Editar
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isSubmitting}
        className="flex items-center gap-2 h-10 px-8"
      >
        {isSubmitting ? (
          <>
            <DeliveryLoader size="sm" message="" className="!space-y-0" />
            <span>Creando Cuenta...</span>
          </>
        ) : (
          'Confirmar y Crear Cuenta'
        )}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Registro"
      description="Por favor, revisa que toda la información sea correcta antes de finalizar."
      size="lg"
      footer={footerContent}
    >
      <div className="space-y-8 py-2">
        {/* Datos Personales */}
        <section>
          <h4 className="text-sm font-semibold text-[var(--surface-dark)] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Datos del Representante
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nombre Completo</p>
              <p className="text-base font-medium text-gray-900">
                {formattedData.user?.first_name} {formattedData.user?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Documento de Identidad</p>
              <p className="text-base font-medium text-gray-900">
                {formattedData.tipo_documento_label} {formattedData.user?.document_number}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Correo Electrónico</p>
              <p className="text-base font-medium text-gray-900">{formattedData.user?.email}</p>
            </div>
          </div>
        </section>

        {/* Datos de la Empresa */}
        <section>
          <h4 className="text-sm font-semibold text-[var(--surface-dark)] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Datos de la Empresa
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Razón Social</p>
              <p className="text-base font-medium text-gray-900">{formattedData.company?.company_name}</p>
            </div>
            {formattedData.company?.ruc && (
              <div>
                <p className="text-sm text-gray-500 mb-1">RUC</p>
                <p className="text-base font-medium text-gray-900">{formattedData.company.ruc}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Teléfono de Contacto</p>
              <p className="text-base font-medium text-gray-900">{formattedData.company?.phones?.[0]}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Dirección Fiscal / Operativa</p>
              <p className="text-base font-medium text-gray-900">
                {formattedData.company?.addresses?.[0]?.address}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {formattedData.district_label}{formattedData.sector_label ? `, ${formattedData.sector_label}` : ''}, {formattedData.region_label}
              </p>
            </div>
          </div>
        </section>

        {/* Método de Pago */}
        <section>
          <h4 className="text-sm font-semibold text-[var(--surface-dark)] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Método de Abono Inicial
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {paymentMethod === 'bank' ? (
              <>
                <div className="md:col-span-2 flex items-center gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                    🏦
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Cuenta Bancaria</p>
                    <p className="text-sm text-blue-700">{formattedData.banco_label} — {formattedData.tipo_cuenta_label}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Número de Cuenta</p>
                  <p className="text-base font-mono font-medium text-gray-900 tracking-wide">
                    {formattedData.company?.bank_accounts?.[0]?.account_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Titular de la Cuenta</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">
                    {formattedData.company?.bank_accounts?.[0]?.account_holder}
                  </p>
                </div>
                {formattedData.company?.bank_accounts?.[0]?.cci_number && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">CCI</p>
                    <p className="text-sm font-mono text-gray-900">
                      {formattedData.company?.bank_accounts?.[0]?.cci_number}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="md:col-span-2 flex items-center gap-3 bg-green-50/50 p-3 rounded-lg border border-green-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">
                    📱
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Billetera Digital</p>
                    <p className="text-sm text-green-700">{formattedData.app_pago_label}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Número de Celular</p>
                  <p className="text-base font-mono font-medium text-gray-900 tracking-wide">
                    {formattedData.company?.payment_apps?.[0]?.phone_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Titular</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">
                    {formattedData.company?.payment_apps?.[0]?.account_holder}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}