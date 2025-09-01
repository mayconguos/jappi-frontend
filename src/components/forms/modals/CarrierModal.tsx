'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import api from '@/app/services/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';
import Modal, { ModalFooter } from '@/components/ui/modal';
import DeliveryLoader from '@/components/ui/delivery-loader';

import { DOCUMENT_TYPES, DEFAULT_DOCUMENT_TYPE } from '@/constants/documentTypes';
import { DEFAULT_CARRIER_ROLE } from '@/constants/userRoles'
import {
  carrierSchema,
  carrierEditSchema,
  type CarrierFormData,
  type CarrierEditFormData
} from '@/lib/validations/carrier';

interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

// Roless de usuario específicos para usuarios

interface Carrier {
  id?: number;
  document_number: string;
  document_type: string;
  email: string;
  first_name: string;
  last_name: string | null;
  license: string;
  brand: string;
  plate_number: string;
  vehicle_type: string;
  password: string;
  status: number;
  id_role: number;
}

interface CarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (carrier: Omit<Carrier, 'id'>) => void;
  editingCarrier?: Carrier | null;
}

export default function CarrierModal({ isOpen, onClose, onSubmit, editingCarrier }: CarrierModalProps) {
  const isEditing = !!editingCarrier;

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm<CarrierFormData | CarrierEditFormData>({
    resolver: zodResolver(isEditing ? carrierEditSchema : carrierSchema),
    defaultValues: {
      document_type: DEFAULT_DOCUMENT_TYPE,
      document_number: '',
      email: '',
      first_name: '',
      last_name: '',
      license: '',
      brand: '',
      plate_number: '',
      vehicle_type: 'car',
      password: '',
      status: 0,
      id_role: DEFAULT_CARRIER_ROLE
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // Llenar el formulario cuando se está editando
  useEffect(() => {
    if (editingCarrier) {
      reset({
        document_number: editingCarrier.document_number || '',
        document_type: editingCarrier.document_type || DEFAULT_DOCUMENT_TYPE,
        email: editingCarrier.email || '',
        first_name: editingCarrier.first_name || '',
        last_name: editingCarrier.last_name || '',
        license: editingCarrier.license || '',
        brand: editingCarrier.brand || '',
        plate_number: editingCarrier.plate_number || '',
        vehicle_type: (editingCarrier.vehicle_type as 'car' | 'motorcycle' | 'truck' | 'bicycle') || 'car',
        password: '', // No mostrar la contraseña actual
        status: editingCarrier.status ?? 1,
        id_role: editingCarrier.id_role || DEFAULT_CARRIER_ROLE
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        document_type: DEFAULT_DOCUMENT_TYPE,
        document_number: '',
        email: '',
        password: '',
        id_role: DEFAULT_CARRIER_ROLE,
        license: '',
        brand: '',
        plate_number: '',
        vehicle_type: 'car',
        status: 0
      });
    }
    setApiError('');
  }, [editingCarrier, isOpen, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onFormSubmit: SubmitHandler<CarrierFormData | CarrierEditFormData> = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');

      let requestBody: { [key in keyof Carrier]?: string | number };

      if (editingCarrier) {
        // Solo enviar los campos que han cambiado
        requestBody = {};
        Object.keys(dirtyFields).forEach(field => {
          const key = field as keyof Carrier;
          requestBody[key] = data[key as keyof typeof data];
        });
      } else {
        // Para crear, enviar todos los campos necesarios
        const createData = data as CarrierFormData;
        requestBody = {
          ...createData,  //XANADU, ver si esto se puede aplicar para workers
        };
      }

      let response;
      if (editingCarrier) {
        // Actualizar usuario existente
        response = await api.put(`/user/update/${editingCarrier.id}`, requestBody, {
          headers: {
            authorization: `${token}`,
          },
        });
      } else {
        // Crear nuevo usuario
        response = await api.post('/user', requestBody, {
          headers: {
            authorization: `${token}`,
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        onSubmit(data as Omit<Carrier, 'id'>);

        // Resetear formulario
        reset();
      } else {
        const action = editingCarrier ? 'actualizar' : 'crear';
        setApiError(response.data?.message || `Error al ${action} el transportista`);
      }
    } catch (error: unknown) {
      console.error('Error al procesar transportista:', error);

      // Manejar diferentes tipos de errores
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          setApiError(axiosError.response.data?.message || 'Datos inválidos');
        } else if (axiosError.response?.status === 401) {
          setApiError('No autorizado. Por favor, inicie sesión nuevamente');
        } else if (axiosError.response?.status === 409) {
          setApiError('Ya existe un transportista con este correo');
        } else {
          setApiError('Error del servidor. Intente nuevamente');
        }
      } else {
        setApiError('Error del servidor. Intente nuevamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setApiError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingCarrier ? 'Editar transportista' : 'Añadir transportista'}
        size="md"
        showCloseButton
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol de usuario
            </label>
            <Input
              value={DEFAULT_CARRIER_ROLE}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            {errors.id_role && (
              <p className="text-red-500 text-xs mt-1">{errors.id_role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <Input
              {...register('first_name')}
              placeholder="Ingrese el nombre"
              className={errors.first_name ? 'border-red-500' : ''}
              onChange={(e) => {
                setValue('first_name', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <Input
              {...register('last_name')}
              placeholder="Ingrese el apellido"
              className={errors.last_name ? 'border-red-500' : ''}
              onChange={(e) => {
                setValue('last_name', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de documento *
            </label>
            <Select
              value={watch('document_type')}
              options={DOCUMENT_TYPES}
              onChange={(value: string) => {
                setValue('document_type', value);
                clearErrors('document_type');
                // Limpiar el número de documento cuando cambie el tipo
                setValue('document_number', '');
                clearErrors('document_number');
              }}
            />
            {errors.document_type && (
              <p className="text-red-500 text-xs mt-1">{errors.document_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de documento *
            </label>
            <Input
              {...register('document_number')}
              placeholder="Ingrese el número de documento"
              className={errors.document_number ? 'border-red-500' : ''}
            />
            {errors.document_number && (
              <p className="text-red-500 text-xs mt-1">{errors.document_number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico *
            </label>
            <Input
              type="email"
              {...register('email')}
              placeholder="Ingrese el correo electrónico"
              className={errors.email ? 'border-red-500' : ''}
              autoComplete="username"
              disabled={!!editingCarrier}
              onChange={(e) => {
                setValue('email', e.target.value.toLowerCase(), { shouldDirty: true });
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
            {editingCarrier && (
              <p className="text-gray-500 text-xs mt-1">El correo no puede ser modificado</p>
            )}
          </div>

          {!editingCarrier && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <PasswordInput
                value={watch('password') || ''}
                onChange={(value) => setValue('password', value)}
                placeholder="Ingrese la contraseña"
                disabled={isLoading}
                error={
                  typeof errors === 'object' && errors !== null &&
                    'password' in errors &&
                    errors.password &&
                    typeof errors.password === 'object' &&
                    'message' in errors.password
                    ? (errors.password as { message: string }).message
                    : undefined
                }
                autoComplete="new-password"
              />
            </div>
          )}

          <ModalFooter>
            <Button
              type="button"
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (isEditing && Object.keys(dirtyFields).length === 0)}
              className="bg-primary text-white disabled:opacity-50"
            >
              {isLoading ?
                (editingCarrier ? 'Actualizando...' : 'Guardando...') :
                (editingCarrier ? 'Actualizar' : 'Guardar')
              }
            </Button>
          </ModalFooter>
        </form>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <DeliveryLoader message={editingCarrier ? 'Actualizando usuario...' : 'Guardando usuario...'} />
          </div>
        )}
      </Modal>
    </>
  );
}
