'use client';

import React from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PERSONAL_DOCUMENT_TYPES } from '@/constants/documentTypes';
import { DISTRITOS_LIMA, BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';

import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { getPersonalDocumentValidationInfo } from '@/lib/validations/common';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // Valida en cada cambio
    reValidateMode: 'onChange', // Re-valida en cada cambio
    defaultValues: {
      type: 2, // Siempre empresa
      accounts: [
        {
          account_number: '',
          account_type: 1,
          cci_number: '',
          account_holder: '',
          bank: 1
        }
      ]
    }
  });

  const watchedValues = watch();

  // Obtener información de validación para el tipo de documento actual
  const documentValidationInfo = React.useMemo(() => {
    return getPersonalDocumentValidationInfo(watchedValues.document_type || '');
  }, [watchedValues.document_type]);

  // Validación en tiempo real del número de documento
  const documentNumberError = React.useMemo(() => {
    if (!watchedValues.document_type || !watchedValues.document_number) {
      return null;
    }

    const isValid = documentValidationInfo.pattern.test(watchedValues.document_number);

    if (!isValid) {
      // Retornar el mensaje específico según el tipo de documento
      switch (watchedValues.document_type) {
        case '1':
          return 'El DNI debe tener exactamente 8 dígitos numéricos';
        case '4':
          return 'El Carnet de extranjería debe tener máximo 12 caracteres alfanuméricos';
        case '7':
          return 'El Pasaporte debe tener máximo 12 caracteres alfanuméricos';
        case '0':
          return 'El documento debe tener máximo 15 caracteres alfanuméricos';
        case 'A':
          return 'La Cédula Diplomática debe tener máximo 15 caracteres alfanuméricos';
        default:
          return 'Número de documento inválido';
      }
    }
    return null;
  }, [watchedValues.document_type, watchedValues.document_number, documentValidationInfo.pattern]);

  // Validación en tiempo real del número de cuenta
  const accountNumberError = React.useMemo(() => {
    const accountNumber = watchedValues.accounts?.[0]?.account_number;
    if (!accountNumber) {
      return null;
    }

    if (accountNumber.length < 10) {
      return 'El número de cuenta debe tener al menos 10 dígitos';
    }

    return null;
  }, [watchedValues.accounts]);

  // Función para obtener la ubicación del usuario
  const getCurrentLocation = React.useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude.toString());
          setValue('longitude', position.coords.longitude.toString());
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error);
        }
      );
    }
  }, [setValue]);

  // Obtener ubicación al cargar el componente
  React.useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('Datos del formulario:', data);
      // Aquí iría la lógica para enviar los datos al servidor
    } catch (error) {
      console.error('Error al registrar:', error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl w-full">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Registro de Empresa
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Personales */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Datos Personales</h2>

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

        {/* Datos de la Empresa y Cuenta Bancaria */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Datos de la Empresa y Cuenta Bancaria</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa *
              </label>
              <Input
                {...register('company_name')}
                type="text"
                placeholder="Nombre de tu empresa"
                autoComplete="organization"
                value={watchedValues.company_name || ''}
                onChange={async (e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setValue('company_name', upperValue);
                  await trigger('company_name');
                }}
              />
              {errors.company_name && (
                <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <Input
                {...register('address')}
                type="text"
                placeholder="Av. Ejemplo 123, Oficina 456"
                autoComplete="street-address"
                value={watchedValues.address || ''}
                onChange={async (e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setValue('address', upperValue);
                  await trigger('address');
                }}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Distrito *"
                value={watchedValues.district?.toString() || ''}
                onChange={(value) => setValue('district', parseInt(value))}
                options={DISTRITOS_LIMA.map(distrito => ({ label: distrito.label, value: distrito.value.toString() }))}
              />
              {errors.district && (
                <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                {...register('phone')}
                type="text"
                placeholder="(01) 234-5678 o 987654321"
                autoComplete="tel"
                maxLength={15}
                onChange={async (e) => {
                  // Permitir números, espacios, guiones, paréntesis y signo +
                  const value = e.target.value.replace(/[^\d\-\+\(\)\s]/g, '');
                  setValue('phone', value);
                  await trigger('phone');
                }}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Teléfono fijo o celular (6-15 dígitos)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUC (opcional)
              </label>
              <Input
                {...register('ruc')}
                type="text"
                placeholder="12345678901"
                maxLength={11}
                autoComplete="off"
                onChange={async (e) => {
                  // Solo permitir números para RUC
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('ruc', value);
                  await trigger('ruc');
                }}
              />
              {errors.ruc && (
                <p className="text-red-500 text-sm mt-1">{errors.ruc.message}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                11 dígitos numéricos
              </p>
            </div>
          </div>

          {/* Datos de la Cuenta Bancaria */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <h3 className="text-md font-medium text-gray-700">Información Bancaria</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Cuenta *
                </label>
                <Input
                  {...register('accounts.0.account_number')}
                  type="text"
                  placeholder="123456789012"
                  autoComplete="off"
                  maxLength={20}
                  onChange={async (e) => {
                    // Solo permitir números para número de cuenta
                    const value = e.target.value.replace(/\D/g, '');
                    setValue('accounts.0.account_number', value);
                    await trigger('accounts.0.account_number');
                  }}
                  className={accountNumberError ? 'border-red-500' : ''}
                />
                {(errors.accounts?.[0]?.account_number || accountNumberError) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accounts?.[0]?.account_number?.message || accountNumberError}
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
                  {...register('accounts.0.account_holder')}
                  type="text"
                  placeholder="Nombre completo del titular"
                  autoComplete="off"
                  value={watchedValues.accounts?.[0]?.account_holder || ''}
                  onChange={async (e) => {
                    const upperValue = e.target.value.toUpperCase();
                    setValue('accounts.0.account_holder', upperValue);
                    await trigger('accounts.0.account_holder');
                  }}
                />
                {errors.accounts?.[0]?.account_holder && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accounts[0]?.account_holder?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Banco *"
                  value={watchedValues.accounts?.[0]?.bank?.toString() || ''}
                  onChange={(value) => setValue('accounts.0.bank', parseInt(value))}
                  options={BANCOS.map(banco => ({ label: banco.label, value: banco.value.toString() }))}
                />
                {errors.accounts?.[0]?.bank && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accounts[0]?.bank?.message}
                  </p>
                )}
              </div>

              <div>
                <Select
                  label="Tipo de Cuenta *"
                  value={watchedValues.accounts?.[0]?.account_type?.toString() || ''}
                  onChange={(value) => setValue('accounts.0.account_type', parseInt(value))}
                  options={TIPOS_CUENTA.map(tipo => ({ label: tipo.label, value: tipo.value.toString() }))}
                />
                {errors.accounts?.[0]?.account_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accounts[0]?.account_type?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CCI (opcional)
                </label>
                <Input
                  {...register('accounts.0.cci_number')}
                  type="text"
                  placeholder="00200000000000000000"
                  autoComplete="off"
                  maxLength={20}
                  onChange={async (e) => {
                    // Solo permitir números para CCI
                    const value = e.target.value.replace(/\D/g, '');
                    setValue('accounts.0.cci_number', value);
                    await trigger('accounts.0.cci_number');
                  }}
                />
                {errors.accounts?.[0]?.cci_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accounts[0]?.cci_number?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !!documentNumberError || !!accountNumberError}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Empresa'}
        </Button>
      </form>
    </div>
  );
}