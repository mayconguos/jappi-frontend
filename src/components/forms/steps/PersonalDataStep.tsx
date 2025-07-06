'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PERSONAL_DOCUMENT_TYPES } from '@/constants/documentTypes';
import { getPersonalDocumentValidationInfo } from '@/lib/validations/common';
import { RegisterFormData } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';

interface PersonalDataStepProps {
  form: UseFormReturn<RegisterFormData>;
  watchedValues: RegisterFormData;
  documentNumberError: string;
}

export function PersonalDataStep({ form, watchedValues, documentNumberError }: PersonalDataStepProps) {
  const { register, formState: { errors }, setValue, trigger } = form;

  // Obtener información de validación para el tipo de documento actual
  const documentValidationInfo = React.useMemo(() => {
    return getPersonalDocumentValidationInfo(watchedValues.document_type || '');
  }, [watchedValues.document_type]);

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Primera fila: Nombres, Apellidos, Tipo de Documento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombres *
          </label>
          <Input
            {...register('first_name')}
            type="text"
            placeholder="Ingresa tus nombres"
            autoComplete="given-name"
            value={watchedValues.first_name || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('first_name', upperValue);
              await trigger('first_name');
            }}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos *
          </label>
          <Input
            {...register('last_name')}
            type="text"
            placeholder="Ingresa tus apellidos"
            autoComplete="family-name"
            value={watchedValues.last_name || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('last_name', upperValue);
              await trigger('last_name');
            }}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
          )}
        </div>

        <div>
          <Select
            label="Tipo de Documento *"
            value={watchedValues.document_type || ''}
            onChange={async (value) => {
              setValue('document_type', value);
              // Limpiar el número de documento cuando cambie el tipo
              setValue('document_number', '');
              await trigger(['document_type', 'document_number']);
            }}
            options={PERSONAL_DOCUMENT_TYPES.map(doc => ({ label: doc.label, value: doc.value }))}
          />
          {errors.document_type && (
            <p className="text-red-500 text-sm mt-1">{errors.document_type.message}</p>
          )}
        </div>
      </div>

      {/* Segunda fila: Número de Documento, Email, Contraseña */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento *
          </label>
          <Input
            {...register('document_number')}
            type="text"
            placeholder={documentValidationInfo.placeholder}
            autoComplete="off"
            maxLength={documentValidationInfo.maxLength}
            onChange={async (e) => {
              let value = e.target.value;

              // Aplicar filtros según el tipo de documento
              if (documentValidationInfo.allowOnlyNumbers) {
                value = value.replace(/\D/g, ''); // Solo números
              }

              setValue('document_number', value);
              await trigger('document_number');
            }}
            className={documentNumberError ? 'border-red-500' : ''}
          />
          {(errors.document_number || documentNumberError) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.document_number?.message || documentNumberError}
            </p>
          )}
          {watchedValues.document_type && (
            <p className="text-gray-500 text-xs mt-1">
              {documentValidationInfo.helpText}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            {...register('email')}
            type="email"
            placeholder="tu@ejemplo.com"
            autoComplete="email"
            value={watchedValues.email || ''}
            onChange={async (e) => {
              const lowerValue = e.target.value.toLowerCase();
              setValue('email', lowerValue);
              await trigger('email');
            }}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <PasswordInput
            {...register('password')}
            value={watchedValues.password || ''}
            onChange={async (value) => {
              setValue('password', value);
              await trigger('password');
            }}
            label="Contraseña *"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            autoComplete="new-password"
          />
        </div>
      </div>
    </div>
  );
}
