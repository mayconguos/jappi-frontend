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
  const { register, formState: { errors }, setValue, trigger } = form;

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
              onClick={(id) => setPaymentMethod(id as 'bank' | 'app')}
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
              onClick={(id) => setPaymentMethod(id as 'bank' | 'app')}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cuenta *
              </label>
              <Input
                {...register('company.bank_accounts.0.account_number')}
                type="text"
                placeholder="123456789012"
                autoComplete="off"
                maxLength={20}
                onChange={async (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('company.bank_accounts.0.account_number', value);
                  await trigger('company.bank_accounts.0.account_number');
                }}
                className={accountNumberError ? 'border-red-500' : ''}
              />
              {(errors.company?.bank_accounts?.[0]?.account_number || accountNumberError) && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company?.bank_accounts?.[0]?.account_number?.message || accountNumberError}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Solo números, entre 10 y 20 dígitos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titular de la Cuenta *
              </label>
              <Input
                {...register('company.bank_accounts.0.account_holder')}
                type="text"
                placeholder="Nombre completo del titular"
                autoComplete="off"
                value={watchedValues.company?.bank_accounts?.[0]?.account_holder || ''}
                onChange={async (e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setValue('company.bank_accounts.0.account_holder', upperValue);
                  await trigger('company.bank_accounts.0.account_holder');
                }}
              />
              {errors.company?.bank_accounts?.[0]?.account_holder && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company.bank_accounts[0].account_holder.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Banco *"
                value={watchedValues.company?.bank_accounts?.[0]?.bank?.toString() || ''}
                onChange={(value) => setValue('company.bank_accounts.0.bank', parseInt(value))}
                options={BANCOS.map(banco => ({ label: banco.label, value: banco.value.toString() }))}
              />
              {errors.company?.bank_accounts?.[0]?.bank && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company.bank_accounts[0].bank.message}
                </p>
              )}
            </div>

            <div>
              <Select
                label="Tipo de Cuenta *"
                value={watchedValues.company?.bank_accounts?.[0]?.account_type?.toString() || ''}
                onChange={(value) => setValue('company.bank_accounts.0.account_type', parseInt(value))}
                options={TIPOS_CUENTA.map(tipo => ({ label: tipo.label, value: tipo.value.toString() }))}
              />
              {errors.company?.bank_accounts?.[0]?.account_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company.bank_accounts[0].account_type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CCI (opcional)
              </label>
              <Input
                {...register('company.bank_accounts.0.cci_number')}
                type="text"
                placeholder="00200000000000000000"
                autoComplete="off"
                maxLength={20}
                onChange={async (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('company.bank_accounts.0.cci_number', value);
                  await trigger('company.bank_accounts.0.cci_number');
                }}
              />
              {errors.company?.bank_accounts?.[0]?.cci_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company.bank_accounts[0].cci_number.message}
                </p>
              )}
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
              />
              {errors.company?.payment_apps?.[0]?.app_name && (
                <p className="text-red-500 text-sm mt-1">{errors.company.payment_apps[0].app_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Celular *
              </label>
              <Input
                {...register('company.payment_apps.0.phone_number')}
                type="text"
                placeholder="987654321"
                autoComplete="tel"
                maxLength={9}
                onChange={async (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('company.payment_apps.0.phone_number', value);
                  await trigger('company.payment_apps.0.phone_number');
                }}
                className={paymentPhoneError ? 'border-red-500' : ''}
              />
              {(errors.company?.payment_apps?.[0]?.phone_number || paymentPhoneError) && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company?.payment_apps?.[0]?.phone_number?.message || paymentPhoneError}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Debe empezar con 9 y tener 9 dígitos, ej: 987654321
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titular de la Cuenta *
              </label>
              <Input
                {...register('company.payment_apps.0.account_holder')}
                type="text"
                placeholder="Nombre completo del titular"
                autoComplete="off"
                value={watchedValues.company?.payment_apps?.[0]?.account_holder || ''}
                onChange={async (e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setValue('company.payment_apps.0.account_holder', upperValue);
                  await trigger('company.payment_apps.0.account_holder');
                }}
              />
              {errors.company?.payment_apps?.[0]?.account_holder && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company.payment_apps[0].account_holder.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento (opcional)
              </label>
              <Input
                {...register('company.payment_apps.0.document_number')}
                type="text"
                placeholder="12345678"
                autoComplete="off"
                maxLength={20}
                onChange={async (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('company.payment_apps.0.document_number', value);
                  await trigger('company.payment_apps.0.document_number');
                }}
              />
              {errors.company?.payment_apps?.[0]?.document_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company.payment_apps[0].document_number.message}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Solo números
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
