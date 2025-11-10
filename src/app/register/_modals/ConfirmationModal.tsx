'use client';

import React from 'react';
import { RegisterFormData } from '@/lib/validations/auth';
import { PERSONAL_DOCUMENT_TYPES } from '@/constants/documentTypes';
import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Registro"
      description="Revisa los datos antes de completar el registro"
      size="md"
    >
      <div className="space-y-4">
        {/* Resumen compacto de todos los datos */}
        <div className="space-y-3 text-xs">
          {/* Datos Personales */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              🏠 Datos Personales
            </h4>
            <div className="space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Nombre:</span> {formattedData.user?.first_name} {formattedData.user?.last_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Documento:</span> {formattedData.tipo_documento_label} {formattedData.user?.document_number}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {formattedData.user?.email}
              </p>
            </div>
          </div>

          {/* Datos de la Empresa */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              🏢 Empresa
            </h4>
            <div className="space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Empresa:</span> {formattedData.company?.company_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Dirección:</span> {formattedData.company?.addresses?.[0]?.address}, {formattedData.district_label}{formattedData.sector_label ? `, ${formattedData.sector_label}` : ''}, {formattedData.region_label}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Teléfono:</span> {formattedData.company?.phones?.[0]}
              </p>
              {formattedData.company?.ruc && (
                <p className="text-gray-700">
                  <span className="font-medium">RUC:</span> {formattedData.company.ruc}
                </p>
              )}
            </div>
          </div>

          {/* Método de Pago */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              💳 Método de Pago
            </h4>
            <div className="space-y-1">
              {paymentMethod === 'bank' ? (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Tipo:</span> Cuenta Bancaria
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Banco:</span> {formattedData.banco_label}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Cuenta:</span> {formattedData.tipo_cuenta_label} - {formattedData.company?.bank_accounts?.[0]?.account_number}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Titular:</span> {formattedData.company?.bank_accounts?.[0]?.account_holder}
                  </p>
                  {formattedData.company?.bank_accounts?.[0]?.cci_number && (
                    <p className="text-gray-700">
                      <span className="font-medium">CCI:</span> {formattedData.company?.bank_accounts?.[0]?.cci_number}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Tipo:</span> App de Pagos
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">App:</span> {formattedData.app_pago_label}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Celular:</span> {formattedData.company?.payment_apps?.[0]?.phone_number}
                  </p>
                  {formattedData.company?.payment_apps?.[0]?.account_holder && (
                    <p className="text-gray-700">
                      <span className="font-medium">Titular:</span> {formattedData.company?.payment_apps?.[0]?.account_holder}
                    </p>
                  )}
                  {formattedData.company?.payment_apps?.[0]?.document_number && (
                    <p className="text-gray-700">
                      <span className="font-medium">Documento:</span> {formattedData.company?.payment_apps?.[0]?.document_number}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer del Modal */}
      <ModalFooter className="py-3">
        <Button
          variant="outline"
          onClick={onClose}
          size="sm"
        >
          Editar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex items-center gap-2"
          size="sm"
        >
          {isSubmitting ? (
            <>
              <DeliveryLoader size="sm" message="" className="!space-y-0" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>Confirmar</span>
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}