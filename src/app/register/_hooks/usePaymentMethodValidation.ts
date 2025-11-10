'use client';

import { useMemo } from 'react';
import { RegisterFormData } from '@/lib/validations/auth';

export function usePaymentMethodValidation(
  formData: RegisterFormData, 
  paymentMethod: 'bank' | 'app' | null
) {
  // Validación en tiempo real del número de celular para apps de pago
  const paymentPhoneError = useMemo(() => {
    // Solo validar si el método de pago es 'app'
    if (paymentMethod !== 'app') {
      return null;
    }

    const paymentPhone = formData.company?.payment_apps?.[0]?.phone_number;

    // Si no hay teléfono, no hay error (pero será requerido en el form validation)
    if (!paymentPhone) {
      return null;
    }

    // Validar formato del teléfono
    if (paymentPhone.length > 0 && paymentPhone.length < 9) {
      return 'Debe tener exactamente 9 dígitos';
    }

    if (paymentPhone.length === 9 && !paymentPhone.startsWith('9')) {
      return 'Debe empezar con 9';
    }

    return null;
  }, [formData.company, paymentMethod]);

  // Validación en tiempo real del número de cuenta
  const accountNumberError = useMemo(() => {
    const accountNumber = formData.company?.bank_accounts?.[0]?.account_number;
    if (!accountNumber) {
      return null;
    }

    if (accountNumber.length < 10) {
      return 'Debe tener al menos 10 dígitos';
    }

    return null;
  }, [formData.company]);

  // Extraer variables específicas para las dependencias
  const bankData = formData.company?.bank_accounts?.[0];
  const appData = formData.company?.payment_apps?.[0];
  
  // Extraer campos específicos para forzar re-render
  const bankAccountNumber = bankData?.account_number;
  const bankAccountHolder = bankData?.account_holder;
  const bankId = bankData?.bank;
  const bankAccountType = bankData?.account_type;
  
  const appName = appData?.app_name;
  const appPhoneNumber = appData?.phone_number;
  const appAccountHolder = appData?.account_holder;

  // Validación de completitud del step según el método de pago
  const isStepComplete = useMemo(() => {
    if (!paymentMethod) {
      return false;
    }

    // Verificar errores críticos
    if (accountNumberError || paymentPhoneError) {
      return false;
    }

    if (paymentMethod === 'bank') {
      // Validar datos de cuenta bancaria usando las variables extraídas
      const accountNumberValid = !!bankAccountNumber;
      const accountHolderValid = !!bankAccountHolder;
      const bankValid = !!(bankId && bankId > 0);
      const accountTypeValid = !!(bankAccountType && bankAccountType > 0);
      
      const isValid = accountNumberValid && accountHolderValid && bankValid && accountTypeValid;
      return isValid;
    } else if (paymentMethod === 'app') {
      // Validar datos de app de pagos - campos obligatorios usando las variables extraídas
      return !!(
        appName &&
        appPhoneNumber &&
        appPhoneNumber.length === 9 &&
        appPhoneNumber.startsWith('9') &&
        appAccountHolder &&
        appAccountHolder.trim() !== ''
      );
    }

    return false;
  }, [
    // Campos específicos para detectar cambios
    bankAccountNumber,
    bankAccountHolder,
    bankId,
    bankAccountType,
    appName,
    appPhoneNumber,
    appAccountHolder,
    paymentMethod,
    accountNumberError,
    paymentPhoneError
  ]);

  return {
    paymentPhoneError,
    accountNumberError,
    isStepComplete
  };
}