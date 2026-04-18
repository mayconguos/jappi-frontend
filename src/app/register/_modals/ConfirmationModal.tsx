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
      description="Revisa que todo sea correcto antes de finalizar."
      size="lg"
      footer={footerContent}
      className="max-h-[85vh]"
    >
      <div className="space-y-2">

        {/* ── Datos del Representante ── */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <SectionHeader color="bg-[#02997d]" label="Representante" />
          <div className="divide-y divide-gray-50/80">
            <Row label="Nombre" value={`${formattedData.user?.first_name ?? ''} ${formattedData.user?.last_name ?? ''}`} />
            <Row label="Documento" value={`${formattedData.tipo_documento_label ?? ''} · ${formattedData.user?.document_number ?? ''}`} />
            <Row label="Email" value={formattedData.user?.email ?? ''} mono />
          </div>
        </div>

        {/* ── Datos de la Empresa ── */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <SectionHeader color="bg-indigo-400" label="Empresa" />
          <div className="divide-y divide-gray-50/80">
            <Row label="Razón Social" value={formattedData.company?.company_name ?? ''} />
            {/* RUC + Teléfono en la misma fila */}
            <RowPair
              left={{ label: 'RUC', value: formattedData.company?.ruc ?? '—', mono: true }}
              right={{ label: 'Teléfono', value: formattedData.company?.phones?.[0] ?? '—', mono: true }}
            />
            <Row
              label="Dirección"
              value={formattedData.company?.addresses?.[0]?.address ?? ''}
              sub={[
                formattedData.district_label,
                formattedData.sector_label,
                formattedData.region_label
              ].filter(Boolean).join(', ')}
            />
          </div>
        </div>

        {/* ── Método de Abono ── */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <SectionHeader color="bg-amber-400" label="Método de Abono" />
          {paymentMethod === 'bank' ? (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-400 leading-none mb-0.5">
                  {formattedData.banco_label}
                  <span className="mx-1 text-gray-200">·</span>
                  <span className="uppercase">{formattedData.tipo_cuenta_label}</span>
                </p>
                <p className="text-sm font-semibold text-gray-900 font-mono tracking-wide">
                  {formattedData.company?.bank_accounts?.[0]?.account_number}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-400 leading-none mb-0.5">
                  Billetera Digital
                  <span className="mx-1 text-gray-200">·</span>
                  {formattedData.app_pago_label}
                </p>
                <p className="text-sm font-semibold text-gray-900 font-mono tracking-wide">
                  {formattedData.company?.payment_apps?.[0]?.phone_number}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ color, label }: { color: string; label: string }) {
  return (
    <div className="bg-gray-50 px-4 py-1.5 flex items-center gap-2 border-b border-gray-100">
      <span className={`w-1.5 h-3 rounded-full ${color} shrink-0`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  mono = false,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-baseline gap-x-2 px-4 py-1.5">
      <span className="text-[11px] font-medium text-gray-400 truncate leading-5">{label}</span>
      <div>
        <span className={`text-[13px] font-semibold text-gray-800 break-words leading-5 ${mono ? 'font-mono' : ''}`}>
          {value || <span className="text-gray-300 font-normal italic text-xs">—</span>}
        </span>
        {sub && <p className="text-[11px] text-gray-400 mt-0 capitalize">{sub}</p>}
      </div>
    </div>
  );
}

function RowPair({
  left,
  right,
}: {
  left: { label: string; value: string; mono?: boolean };
  right: { label: string; value: string; mono?: boolean };
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-50/80 px-0">
      <div className="grid grid-cols-[80px_1fr] items-baseline gap-x-2 px-4 py-1.5">
        <span className="text-[11px] font-medium text-gray-400 truncate leading-5">{left.label}</span>
        <span className={`text-[13px] font-semibold text-gray-800 leading-5 ${left.mono ? 'font-mono' : ''}`}>
          {left.value}
        </span>
      </div>
      <div className="grid grid-cols-[70px_1fr] items-baseline gap-x-2 px-4 py-1.5">
        <span className="text-[11px] font-medium text-gray-400 truncate leading-5">{right.label}</span>
        <span className={`text-[13px] font-semibold text-gray-800 leading-5 ${right.mono ? 'font-mono' : ''}`}>
          {right.value}
        </span>
      </div>
    </div>
  );
}