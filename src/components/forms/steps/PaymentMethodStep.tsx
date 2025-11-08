'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData } from '@/lib/validations/auth';
import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';
import { SelectionCard, SelectionCardGroup } from '@/components/ui/selection-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// Opciones de apps de pago
const PAYMENT_APPS = [
  { label: 'YAPE', value: 'yape' },
  { label: 'PLIN', value: 'plin' },
  { label: 'Lukita', value: 'lukita' },
  { label: 'Agora Pay', value: 'agora' }
];

interface PaymentMethodStepProps {
  form: UseFormReturn<RegisterFormData>;
  watchedValues: RegisterFormData;
  paymentMethod: 'bank' | 'app' | null;
  setPaymentMethod: (method: 'bank' | 'app' | null) => void;
  accountNumberError: string | null;
  paymentPhoneError: string | null;
}

export function PaymentMethodStep({ 
  form, 
  watchedValues, 
  paymentMethod, 
  setPaymentMethod,
  accountNumberError,
  paymentPhoneError
}: PaymentMethodStepProps) {
  const { formState: { errors }, setValue, trigger } = form;

  // Función para limpiar los campos del método de pago no seleccionado
  const handlePaymentMethodChange = (method: 'bank' | 'app') => {
    if (method === 'bank') {
      // Limpiar campos de apps de pago
      setValue('company.payment_apps.0.app_name', '');
      setValue('company.payment_apps.0.phone_number', '');
      setValue('company.payment_apps.0.account_holder', '');
      setValue('company.payment_apps.0.document_number', '');
    } else if (method === 'app') {
      // Limpiar campos de cuenta bancaria
      setValue('company.bank_accounts.0.account_number', '');
      setValue('company.bank_accounts.0.account_holder', '');
      setValue('company.bank_accounts.0.bank', 0);
      setValue('company.bank_accounts.0.account_type', 0);
      setValue('company.bank_accounts.0.cci_number', '');
    }
    setPaymentMethod(method);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {!paymentMethod ? (
        <div className="space-y-4">
          <SelectionCardGroup
            description={
              <span>
                Selecciona tu método de pago preferido{' '}
                <span className="font-bold text-[var(--surface-dark)]">para recibir pagos</span>
              </span>
            }
            columns={2}
          >
            <SelectionCard
              id="bank"
              title="Cuenta Bancaria"
              description="Registra una cuenta BBVA, BCP, Interbank, etc"
              color="blue"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              onClick={(id) => handlePaymentMethodChange(id as 'bank' | 'app')}
            />

            <SelectionCard
              id="app"
              title="App de Pagos"
              description="Registra tu número de YAPE, PLIN u otra app de pagos"
              color="green"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
              onClick={(id) => handlePaymentMethodChange(id as 'bank' | 'app')}
            />
          </SelectionCardGroup>
        </div>
      ) : paymentMethod === 'bank' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPaymentMethod(null)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Cambiar método de pago
            </button>
          </div>

          <h3 className="text-md font-medium text-gray-700 mb-4">Información de Cuenta Bancaria</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                name="company.bank_accounts.0.account_number"
                type="text"
                label="Número de Cuenta *"
                autoComplete="off"
                maxLength={20}
                value={watchedValues.company?.bank_accounts?.[0]?.account_number || ''}
                onChange={async (value) => {
                  const numericValue = value.replace(/\D/g, '');
                  setValue('company.bank_accounts.0.account_number', numericValue);
                  await trigger('company.bank_accounts.0.account_number');
                }}
                error={errors.company?.bank_accounts?.[0]?.account_number?.message || accountNumberError || ''}
              />
            </div>

            <div>
              <Input
                name="company.bank_accounts.0.account_holder"
                type="text"
                label="Titular de la Cuenta *"
                autoComplete="off"
                value={watchedValues.company?.bank_accounts?.[0]?.account_holder || ''}
                onChange={async (value) => {
                  const upperValue = value.toUpperCase();
                  setValue('company.bank_accounts.0.account_holder', upperValue);
                  await trigger('company.bank_accounts.0.account_holder');
                }}
                error={errors.company?.bank_accounts?.[0]?.account_holder?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Banco *"
                value={
                  watchedValues.company?.bank_accounts?.[0]?.bank && 
                  watchedValues.company.bank_accounts[0].bank > 0
                    ? watchedValues.company.bank_accounts[0].bank.toString()
                    : ''
                }
                onChange={(value) => setValue('company.bank_accounts.0.bank', parseInt(value))}
                options={BANCOS.map(banco => ({ label: banco.label, value: banco.value.toString() }))}
                error={errors.company?.bank_accounts?.[0]?.bank?.message}
              />
            </div>

            <div>
              <Select
                label="Tipo de Cuenta *"
                value={
                  watchedValues.company?.bank_accounts?.[0]?.account_type && 
                  watchedValues.company.bank_accounts[0].account_type > 0
                    ? watchedValues.company.bank_accounts[0].account_type.toString()
                    : ''
                }
                onChange={(value) => setValue('company.bank_accounts.0.account_type', parseInt(value))}
                options={TIPOS_CUENTA.map(tipo => ({ label: tipo.label, value: tipo.value.toString() }))}
                error={errors.company?.bank_accounts?.[0]?.account_type?.message}
              />
            </div>

            <div>
              <Input
                name="company.bank_accounts.0.cci_number"
                type="text"
                label="CCI (opcional)"
                autoComplete="off"
                maxLength={20}
                value={watchedValues.company?.bank_accounts?.[0]?.cci_number || ''}
                onChange={async (value) => {
                  const numericValue = value.replace(/\D/g, '');
                  setValue('company.bank_accounts.0.cci_number', numericValue);
                  await trigger('company.bank_accounts.0.cci_number');
                }}
                error={errors.company?.bank_accounts?.[0]?.cci_number?.message}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPaymentMethod(null)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              ← Cambiar método de pago
            </button>
          </div>

          <h3 className="text-md font-medium text-gray-700 mb-4">Información de App de Pagos</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="App de Pagos *"
                value={watchedValues.company?.payment_apps?.[0]?.app_name || ''}
                onChange={(value) => setValue('company.payment_apps.0.app_name', value)}
                options={PAYMENT_APPS}
                error={errors.company?.payment_apps?.[0]?.app_name?.message}
              />
            </div>

            <div>
              <Input
                name="company.payment_apps.0.phone_number"
                type="text"
                label="Número de Celular *"
                autoComplete="tel"
                maxLength={9}
                value={watchedValues.company?.payment_apps?.[0]?.phone_number || ''}
                onChange={async (value) => {
                  const numericValue = value.replace(/\D/g, '');
                  setValue('company.payment_apps.0.phone_number', numericValue);
                  await trigger('company.payment_apps.0.phone_number');
                }}
                error={errors.company?.payment_apps?.[0]?.phone_number?.message || paymentPhoneError || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                name="company.payment_apps.0.account_holder"
                type="text"
                label="Titular de la Cuenta *"
                autoComplete="off"
                value={watchedValues.company?.payment_apps?.[0]?.account_holder || ''}
                onChange={async (value) => {
                  const upperValue = value.toUpperCase();
                  setValue('company.payment_apps.0.account_holder', upperValue);
                  await trigger('company.payment_apps.0.account_holder');
                }}
                error={errors.company?.payment_apps?.[0]?.account_holder?.message}
              />
            </div>

            <div>
              <Input
                name="company.payment_apps.0.document_number"
                type="text"
                label="Número de Documento (opcional)"
                autoComplete="off"
                maxLength={20}
                value={watchedValues.company?.payment_apps?.[0]?.document_number || ''}
                onChange={async (value) => {
                  const numericValue = value.replace(/\D/g, '');
                  setValue('company.payment_apps.0.document_number', numericValue);
                  await trigger('company.payment_apps.0.document_number');
                }}
                error={errors.company?.payment_apps?.[0]?.document_number?.message}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
