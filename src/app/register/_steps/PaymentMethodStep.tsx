'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { BANCOS, PAYMENT_APPS, TIPOS_CUENTA } from '@/constants/formOptions';
import { RegisterFormData } from '@/lib/validations/auth';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SelectionCard, SelectionCardGroup } from '@/components/ui/selection-card';
import { usePaymentMethodValidation } from '../_hooks/usePaymentMethodValidation';

interface PaymentMethodStepProps {
  readonly form: UseFormReturn<RegisterFormData>;
  readonly watchedValues: RegisterFormData;
  readonly paymentMethod: 'bank' | 'app' | null;
  readonly setPaymentMethod: (method: 'bank' | 'app' | null) => void;
}

export function PaymentMethodStep({
  form,
  watchedValues,
  paymentMethod,
  setPaymentMethod
}: PaymentMethodStepProps) {
  const { formState: { errors }, setValue, trigger } = form;

  // Hook de validación específico para este step
  const { accountNumberError, paymentPhoneError } = usePaymentMethodValidation(watchedValues, paymentMethod);

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

  // Función para renderizar el contenido según el método de pago
  const renderPaymentContent = () => {
    if (!paymentMethod) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 1. Alerta Informativa */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex gap-4">
            <div className="shrink-0 text-blue-600 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-blue-900">Configura tu cuenta de cobro</h4>
              <p className="text-sm text-blue-700/80 leading-relaxed">
                Necesitamos una cuenta activa para que tus clientes puedan pagarte. No te preocupes, podrás agregar más bancos y billeteras (Yape/Plin) desde tu panel de control más adelante.
              </p>
            </div>
          </div>

          {/* 2. Tarjetas de Selección */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider pl-1">
              Selecciona un método
            </h3>

            <SelectionCardGroup columns={2}>
              <SelectionCard
                id="bank"
                title="Cuenta Bancaria"
                description="Ideal para montos altos. BBVA, BCP, Interbank, etc."
                color="brand"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
                onClick={(id) => handlePaymentMethodChange(id as 'bank' | 'app')}
                className="h-full border-gray-200 hover:border-[#02997d]/50"
              />

              <SelectionCard
                id="app"
                title="Billetera Digital"
                description="Para pagos rápidos. Yape, Plin, etc."
                color="brand"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                onClick={(id) => handlePaymentMethodChange(id as 'bank' | 'app')}
                className="h-full border-gray-200 hover:border-[#02997d]/50"
              />
            </SelectionCardGroup>
          </div>
        </div>
      );
    }

    if (paymentMethod === 'bank') {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Tarjeta Seleccionada (Resumen) */}
          <div className="relative group">
            <SelectionCard
              id="bank"
              title="Cuenta Bancaria"
              description="Ideal para montos altos. BBVA, BCP, Interbank, etc."
              color="brand"
              isSelected={true}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              onClick={() => { }} // No click action when selected
              className="cursor-default"
            />
            <button
              type="button"
              onClick={() => setPaymentMethod(null)}
              className="absolute top-4 right-4 text-xs font-medium text-gray-400 hover:text-[#02997d] transition-colors underline"
            >
              Cambiar método
            </button>
          </div>

          <div className="pt-2">
            <h3 className="text-md font-medium text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#02997d]"></span>
              Completa los datos de tu cuenta
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Select
                    label="Banco *"
                    value={
                      watchedValues.company?.bank_accounts?.[0]?.bank &&
                        watchedValues.company.bank_accounts[0].bank > 0
                        ? watchedValues.company.bank_accounts[0].bank.toString()
                        : ''
                    }
                    onChange={(value) => setValue('company.bank_accounts.0.bank', Number.parseInt(value, 10))}
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
                    onChange={(value) => setValue('company.bank_accounts.0.account_type', Number.parseInt(value, 10))}
                    options={TIPOS_CUENTA.map(tipo => ({ label: tipo.label, value: tipo.value.toString() }))}
                    error={errors.company?.bank_accounts?.[0]?.account_type?.message}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Input
                    name="company.bank_accounts.0.account_number"
                    type="text"
                    label="Número de Cuenta *"
                    autoComplete="off"
                    maxLength={20}
                    value={watchedValues.company?.bank_accounts?.[0]?.account_number || ''}
                    onChange={async (e) => {
                      const value = e.target.value;
                      const numericValue = value.replaceAll(/\D/g, '');
                      setValue('company.bank_accounts.0.account_number', numericValue);
                      await trigger('company.bank_accounts.0.account_number');
                    }}
                    error={errors.company?.bank_accounts?.[0]?.account_number?.message || accountNumberError || undefined}
                  />
                </div>

                <div>
                  <Input
                    name="company.bank_accounts.0.account_holder"
                    type="text"
                    label="Titular de la Cuenta *"
                    autoComplete="off"
                    value={watchedValues.company?.bank_accounts?.[0]?.account_holder || ''}
                    onChange={async (e) => {
                      const value = e.target.value;
                      const upperValue = value.toUpperCase();
                      setValue('company.bank_accounts.0.account_holder', upperValue);
                      await trigger('company.bank_accounts.0.account_holder');
                    }}
                    error={errors.company?.bank_accounts?.[0]?.account_holder?.message}
                  />
                </div>
              </div>

              <div>
                <Input
                  name="company.bank_accounts.0.cci_number"
                  type="text"
                  label="CCI (opcional)"
                  autoComplete="off"
                  maxLength={20}
                  value={watchedValues.company?.bank_accounts?.[0]?.cci_number || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
                    const numericValue = value.replaceAll(/\D/g, '');
                    setValue('company.bank_accounts.0.cci_number', numericValue);
                    await trigger('company.bank_accounts.0.cci_number');
                  }}
                  error={errors.company?.bank_accounts?.[0]?.cci_number?.message}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // paymentMethod === 'app'
    return (

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Tarjeta Seleccionada (Resumen) */}
        <div className="relative group">
          <SelectionCard
            id="app"
            title="Billetera Digital"
            description="Para pagos rápidos. Yape, Plin, etc."
            color="brand"
            isSelected={true}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            onClick={() => { }}
            className="cursor-default"
          />
          <button
            type="button"
            onClick={() => setPaymentMethod(null)}
            className="absolute top-4 right-4 text-xs font-medium text-gray-400 hover:text-[#02997d] transition-colors underline"
          >
            Cambiar método
          </button>
        </div>

        <div className="pt-2">
          <h3 className="text-md font-medium text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#02997d]"></span>
            Completa los datos de tu billetera
          </h3>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  onChange={async (e) => {
                    const value = e.target.value;
                    const numericValue = value.replaceAll(/\D/g, '');
                    setValue('company.payment_apps.0.phone_number', numericValue);
                    await trigger('company.payment_apps.0.phone_number');
                  }}
                  error={errors.company?.payment_apps?.[0]?.phone_number?.message || paymentPhoneError || undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input
                  name="company.payment_apps.0.account_holder"
                  type="text"
                  label="Titular de la Cuenta *"
                  autoComplete="off"
                  value={watchedValues.company?.payment_apps?.[0]?.account_holder || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
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
                  onChange={async (e) => {
                    const value = e.target.value;
                    const numericValue = value.replaceAll(/\D/g, '');
                    setValue('company.payment_apps.0.document_number', numericValue);
                    await trigger('company.payment_apps.0.document_number');
                  }}
                  error={errors.company?.payment_apps?.[0]?.document_number?.message}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderPaymentContent()}
    </div>
  );
}