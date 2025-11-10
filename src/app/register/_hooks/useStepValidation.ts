'use client';

import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData } from '@/lib/validations/auth';
import { usePersonalDataValidation } from './usePersonalDataValidation';
import { useCompanyDataValidation } from './useCompanyDataValidation';
import { usePaymentMethodValidation } from './usePaymentMethodValidation';

export function useStepValidation(
  form: UseFormReturn<RegisterFormData>,
  formData: RegisterFormData,
  paymentMethod: 'bank' | 'app' | null,
  currentStep: number
) {
  const { trigger } = form;

  // Hooks de validación por step
  const personalDataValidation = usePersonalDataValidation(formData);
  const companyDataValidation = useCompanyDataValidation(formData);
  const paymentMethodValidation = usePaymentMethodValidation(formData, paymentMethod);

  // Función para validar el step actual
  const validateCurrentStep = async () => {
    let isValid = true;

    switch (currentStep) {
      case 1: // Datos Personales
        isValid = await trigger(['user.first_name', 'user.last_name', 'user.document_type', 'user.document_number', 'user.email', 'user.password']);
        return isValid && !personalDataValidation.documentNumberError;
      
      case 2: // Datos de la Empresa
        isValid = await trigger(['company.company_name', 'company.addresses.0.address', 'company.addresses.0.id_region', 'company.phones.0']);
        return isValid;
      
      case 3: // Método de Pago
        if (paymentMethod === 'bank') {
          isValid = await trigger(['company.bank_accounts.0.account_number', 'company.bank_accounts.0.account_holder', 'company.bank_accounts.0.bank', 'company.bank_accounts.0.account_type']);
        } else if (paymentMethod === 'app') {
          isValid = await trigger(['company.payment_apps.0.app_name', 'company.payment_apps.0.phone_number', 'company.payment_apps.0.account_holder']);
        } else {
          // Si no ha seleccionado método de pago
          return false;
        }
        return isValid && !paymentMethodValidation.accountNumberError && !paymentMethodValidation.paymentPhoneError;
      
      default:
        return false;
    }
  };

  // Verificar si el formulario está completo para el submit final
  const isFormCompleteForSubmit = useMemo(() => {
    return personalDataValidation.isStepComplete && 
           companyDataValidation.isStepComplete && 
           paymentMethodValidation.isStepComplete;
  }, [personalDataValidation.isStepComplete, companyDataValidation.isStepComplete, paymentMethodValidation.isStepComplete]);

  return {
    // Validaciones por step
    personalDataValidation,
    companyDataValidation,
    paymentMethodValidation,
    
    // Funciones
    validateCurrentStep,
    isFormCompleteForSubmit
  };
}