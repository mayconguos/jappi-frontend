'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PERSONAL_DOCUMENT_TYPES } from '@/constants/documentTypes';
import { RegisterFormData } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';
import { usePersonalDataValidation } from '../_hooks/usePersonalDataValidation';

interface PersonalDataStepProps {
  form: UseFormReturn<RegisterFormData>;
  watchedValues: RegisterFormData;
}

// Función utilitaria para Capitalizar Nombres
const toTitleCase = (str: string) => {
  return str.replace(/\b\w/g, c => c.toUpperCase());
};

export function PersonalDataStep({ form, watchedValues }: PersonalDataStepProps) {
  const { formState: { errors }, setValue, trigger } = form;

  // Hook de validación específico para este step
  const { documentValidationInfo, documentNumberError } = usePersonalDataValidation(watchedValues);

  return (
    <div className="space-y-5">
      {/* Fila 1: Nombres y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Nombres *"
          type="text"
          className="capitalize"
          autoComplete="given-name"
          value={watchedValues.user?.first_name || ''}
          onChange={async (e) => {
            const value = e.target.value;
            const titleValue = toTitleCase(value);
            setValue('user.first_name', titleValue);
            await trigger('user.first_name');
          }}
          error={errors.user?.first_name?.message}
        />

        <Input
          label="Apellidos *"
          type="text"
          className="capitalize"
          autoComplete="family-name"
          value={watchedValues.user?.last_name || ''}
          onChange={async (e) => {
            const value = e.target.value;
            const titleValue = toTitleCase(value);
            setValue('user.last_name', titleValue);
            await trigger('user.last_name');
          }}
          error={errors.user?.last_name?.message}
        />
      </div>

      {/* Fila 2: Documento de Identidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Tipo de Documento *"
          value={watchedValues.user?.document_type || ''}
          onChange={async (value) => {
            setValue('user.document_type', value);
            // Limpiar el número de documento cuando cambie el tipo
            setValue('user.document_number', '');
            await trigger(['user.document_type', 'user.document_number']);
          }}
          options={PERSONAL_DOCUMENT_TYPES.map(doc => ({ label: doc.label, value: doc.value }))}
          error={errors.user?.document_type?.message}
        />

        <Input
          label="Número de Documento *"
          type="text"
          autoComplete="off"
          maxLength={documentValidationInfo.maxLength}
          value={watchedValues.user?.document_number || ''}
          onChange={async (e) => {
            const value = e.target.value;
            let processedValue = value;

            // Aplicar filtros según el tipo de documento
            if (documentValidationInfo.allowOnlyNumbers) {
              processedValue = processedValue.replace(/\D/g, ''); // Solo números
            } else {
              // Para documentos alfanuméricos, aplicar filtros específicos
              if (watchedValues.user?.document_type === '4') {
                // Carnet de extranjería: solo letras y números, convertir a mayúsculas
                processedValue = processedValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
              } else if (watchedValues.user?.document_type === '7') {
                // Pasaporte: formato específico [A-Z]{1,2}\d{6,7}
                // Eliminar caracteres no válidos y formatear
                const cleanValue = processedValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

                // Separar letras y números
                const letters = cleanValue.match(/^[A-Z]*/)?.[0] || '';
                const numbers = cleanValue.replace(/^[A-Z]*/, '').replace(/\D/g, '');

                // Combinar respetando el formato: máximo 2 letras + máximo 7 números
                const maxLetters = letters.slice(0, 2);
                const maxNumbers = numbers.slice(0, 7);

                processedValue = maxLetters + maxNumbers;
              } else if (watchedValues.user?.document_type === 'A') {
                // Cédula Diplomática: formato específico [A-Z]{2}\d{6,8}
                // Eliminar caracteres no válidos y formatear
                const cleanValue = processedValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

                // Separar letras y números
                const letters = cleanValue.match(/^[A-Z]*/)?.[0] || '';
                const numbers = cleanValue.replace(/^[A-Z]*/, '').replace(/\D/g, '');

                // Combinar respetando el formato: exactamente 2 letras + máximo 8 números
                const exactLetters = letters.slice(0, 2);
                const maxNumbers = numbers.slice(0, 8);

                processedValue = exactLetters + maxNumbers;
              } else if (watchedValues.user?.document_type === '0') {
                // Otros: formato específico [A-Z0-9\-]{4,15}
                // Permitir letras, números y guiones, convertir letras a mayúsculas
                processedValue = processedValue.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase();
              }
            }

            setValue('user.document_number', processedValue);
            await trigger('user.document_number');
          }}
          error={errors.user?.document_number?.message || documentNumberError || undefined}
        />
      </div>

      {/* Fila 3: Credenciales */}
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Email *"
          type="email"
          autoComplete="email"
          value={watchedValues.user?.email || ''}
          onChange={async (e) => {
            const value = e.target.value;
            setValue('user.email', value.toLowerCase());
            await trigger('user.email');
          }}
          error={errors.user?.email?.message}
        />

        <PasswordInput
          label="Contraseña *"
          value={watchedValues.user?.password || ''}
          onChange={async (e) => {
            const value = e.target.value;
            setValue('user.password', value);
            await trigger('user.password');
          }}
          error={errors.user?.password?.message}
          autoComplete="new-password"
        />
      </div>
    </div>
  );
}