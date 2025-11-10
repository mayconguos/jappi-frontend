'use client';

import { RegisterFormData } from '@/lib/validations/auth';

export function useCompanyDataValidation(formData: RegisterFormData) {
  const isStepComplete = !!(
    formData.company?.company_name &&
    formData.company?.addresses?.[0]?.address &&
    formData.company?.addresses?.[0]?.id_region &&
    formData.company?.phones?.[0]
  );

  return {
    isStepComplete
  };
}