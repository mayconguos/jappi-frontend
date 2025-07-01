'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import api from '@/app/services/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { DOCUMENT_TYPES, DEFAULT_DOCUMENT_TYPE } from '@/constants/documentTypes';
import { USER_TYPES, DEFAULT_USER_TYPE } from '@/constants/userTypes';
import {
  userSchema,
  userEditSchema,
  type UserFormData,
  type UserEditFormData
} from '@/lib/validations/user';

interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

// Tipos de usuario específicos para usuarios
const ADMIN_USER_TYPES = USER_TYPES.filter(type =>
  type.value === 2 || type.value === 4 || type.value === 5
).map(type => ({
  value: type.value.toString(),
  label: type.label
})); // Admin, Almacén, Coordinación

interface User {
  id?: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  type: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User, 'id'>) => void;
  editingUser?: User | null;
}

export default function UserModal({ isOpen, onClose, onSubmit, editingUser }: UserModalProps) {
  const isEditing = !!editingUser;

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm<UserFormData | UserEditFormData>({
    resolver: zodResolver(isEditing ? userEditSchema : userSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      document_type: DEFAULT_DOCUMENT_TYPE,
      document_number: '',
      email: '',
      password: '',
      type: DEFAULT_USER_TYPE,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Llenar el formulario cuando se está editando
  useEffect(() => {
    if (editingUser) {
      reset({
        first_name: editingUser.first_name || '',
        last_name: editingUser.last_name || '',
        document_type: (editingUser.document_type || DEFAULT_DOCUMENT_TYPE).toString(),
        document_number: editingUser.document_number || '',
        email: editingUser.email || '',
        password: '', // No mostrar la contraseña actual
        type: editingUser.type || DEFAULT_USER_TYPE,
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        document_type: DEFAULT_DOCUMENT_TYPE,
        document_number: '',
        email: '',
        password: '',
        type: DEFAULT_USER_TYPE,
      });
    }
    setApiError('');
  }, [editingUser, isOpen, reset]);

  const onFormSubmit: SubmitHandler<UserFormData | UserEditFormData> = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');

      let requestBody: { [key in keyof User]?: string | number };

      if (editingUser) {
        // Solo enviar los campos que han cambiado
        requestBody = {};
        Object.keys(dirtyFields).forEach(field => {
          const key = field as keyof User;
          requestBody[key] = data[key as keyof typeof data];
        });
      } else {
        // Para crear, enviar todos los campos necesarios
        const createData = data as UserFormData;
        requestBody = {
          first_name: createData.first_name,
          last_name: createData.last_name,
          document_type: createData.document_type,
          document_number: createData.document_number,
          type: createData.type,
          email: createData.email,
          password: createData.password
        };
      }

      let response;
      if (editingUser) {
        // Actualizar usuario existente
        response = await api.put(`/user/update/${editingUser.id}`, requestBody, {
          headers: {
            authorization: `${token}`,
          },
        });
      } else {
        // Crear nuevo usuario
        response = await api.post('/user/create', requestBody, {
          headers: {
            authorization: `${token}`,
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        onSubmit(data as Omit<User, 'id'>);

        // Resetear formulario
        reset();

        // Mostrar modal de éxito solo para actualizaciones
        if (editingUser) {
          setShowSuccessModal(true);
        } else {
          onClose();
        }
      } else {
        const action = editingUser ? 'actualizar' : 'crear';
        setApiError(response.data?.message || `Error al ${action} el usuario`);
      }
    } catch (error: unknown) {
      console.error('Error al procesar usuario:', error);

      // Manejar diferentes tipos de errores
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          setApiError(axiosError.response.data?.message || 'Datos inválidos');
        } else if (axiosError.response?.status === 401) {
          setApiError('No autorizado. Por favor, inicie sesión nuevamente');
        } else if (axiosError.response?.status === 409) {
          setApiError('Ya existe un usuario con este correo');
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

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleClose = () => {
    reset();
    setApiError('');
    onClose();
  };

  if (!isOpen) return null;

  // Modal de éxito
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Actualización exitosa!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              La información del usuario ha sido actualizada correctamente.
            </p>
            <Button
              onClick={handleSuccessModalClose}
              className="w-full bg-primary text-white"
            >
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editingUser ? 'Editar usuario' : 'Añadir usuario'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de usuario *
            </label>
            <Select
              value={watch('type').toString()}
              options={ADMIN_USER_TYPES}
              onChange={(value: string) => {
                setValue('type', parseInt(value));
                clearErrors('type');
              }}
            />
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
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
              disabled={!!editingUser}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
            {editingUser && (
              <p className="text-gray-500 text-xs mt-1">El correo no puede ser modificado</p>
            )}
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <Input
                type="password"
                {...register('password')}
                placeholder="Ingrese la contraseña"
                className={errors.password ? 'border-red-500' : ''}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white disabled:opacity-50"
            >
              {isLoading ?
                (editingUser ? 'Actualizando...' : 'Guardando...') :
                (editingUser ? 'Actualizar' : 'Guardar')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
