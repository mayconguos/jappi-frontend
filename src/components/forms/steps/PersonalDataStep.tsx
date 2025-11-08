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
    return getPersonalDocumentValidationInfo(watchedValues.user?.document_type || '');
  }, [watchedValues.user?.document_type]);

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Primera fila: Nombres, Apellidos, Tipo de Documento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombres *
          </label>
          <Input
            {...register('user.first_name')}
            type="text"
            placeholder="Ingresa tus nombres"
            autoComplete="given-name"
            value={watchedValues.user?.first_name || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('user.first_name', upperValue);
              await trigger('user.first_name');
            }}
          />
          {errors.user?.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.user.first_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos *
          </label>
          <Input
            {...register('user.last_name')}
            type="text"
            placeholder="Ingresa tus apellidos"
            autoComplete="family-name"
            value={watchedValues.user?.last_name || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('user.last_name', upperValue);
              await trigger('user.last_name');
            }}
          />
          {errors.user?.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.user.last_name.message}</p>
          )}
        </div>

        <div>
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
          />
          {errors.user?.document_type && (
            <p className="text-red-500 text-sm mt-1">{errors.user.document_type.message}</p>
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
            {...register('user.document_number')}
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

              setValue('user.document_number', value);
              await trigger('user.document_number');
            }}
            className={documentNumberError ? 'border-red-500' : ''}
          />
          {(errors.user?.document_number || documentNumberError) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.user?.document_number?.message || documentNumberError}
            </p>
          )}
          {watchedValues.user?.document_type && (
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
            {...register('user.email')}
            type="email"
            placeholder="tu@ejemplo.com"
            autoComplete="email"
            value={watchedValues.user?.email || ''}
            onChange={async (e) => {
              const lowerValue = e.target.value.toLowerCase();
              setValue('user.email', lowerValue);
              await trigger('user.email');
            }}
          />
          {errors.user?.email && (
            <p className="text-red-500 text-sm mt-1">{errors.user.email.message}</p>
          )}
        </div>

        <div>
          <PasswordInput
            {...register('user.password')}
            value={watchedValues.user?.password || ''}
            onChange={async (value) => {
              setValue('user.password', value);
              await trigger('user.password');
            }}
            label="Contraseña *"
            placeholder="Mínimo 6 caracteres"
            error={errors.user?.password?.message}
            autoComplete="new-password"
          />
        </div>
      </div>
    </div>
  );
}
