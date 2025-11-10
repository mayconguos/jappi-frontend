'use client';

import { RegisterFormData } from '@/lib/validations/auth';
import { getPersonalDocumentValidationInfo } from '@/lib/validations/common';

export function usePersonalDataValidation(formData: RegisterFormData) {
  // Obtener información de validación para el tipo de documento actual
  const documentValidationInfo = getPersonalDocumentValidationInfo(formData.user?.document_type || '');

  // Validación en tiempo real del número de documento
  let documentNumberError = null;
  if (formData.user?.document_type && formData.user?.document_number) {
    const isValid = documentValidationInfo.pattern.test(formData.user.document_number);

    if (!isValid) {
      // Retornar el mensaje específico según el tipo de documento
      switch (formData.user.document_type) {
        case '1':
          documentNumberError = 'Debe tener exactamente 8 dígitos numéricos';
          break;
        case '4':
          documentNumberError = 'Debe tener máximo 12 caracteres alfanuméricos';
          break;
        case '7':
          documentNumberError = 'Debe tener máximo 12 caracteres alfanuméricos';
          break;
        case '0':
          documentNumberError = 'Debe tener máximo 15 caracteres alfanuméricos';
          break;
        case 'A':
          documentNumberError = 'Debe tener máximo 15 caracteres alfanuméricos';
          break;
        default:
          documentNumberError = 'Número de documento inválido';
      }
    }
  }

  const isStepComplete = !!(
    formData.user?.first_name &&
    formData.user?.last_name &&
    formData.user?.document_type &&
    formData.user?.document_number &&
    formData.user?.email &&
    formData.user?.password &&
    !documentNumberError
  );

  return {
    documentValidationInfo,
    documentNumberError,
    isStepComplete
  };
}