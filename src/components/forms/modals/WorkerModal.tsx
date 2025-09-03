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
import { USER_ROLES, DEFAULT_USER_ROLE } from '@/constants/userRoles'
import {
  workerSchema,
  workerEditSchema,
  type WorkerFormData,
  type WorkerEditFormData
} from '@/lib/validations/worker';

interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

// Roless de usuario específicos para usuarios
const ADMIN_USER_ROLES = USER_ROLES.filter(role =>
  role.value === 1 || role.value === 4 || role.value === 5
).map(role => ({
  value: role.value.toString(),
  label: role.label
})); // Admin, Almacén, Coordinación

interface Worker {
  id?: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  id_role: number;
  status: number;
}

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (worker: Omit<Worker, 'id'>) => void;
  editingWorker?: Worker | null;
}

export default function WorkerModal({ isOpen, onClose, onSubmit, editingWorker }: WorkerModalProps) {
  const isEditing = !!editingWorker;

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm<WorkerFormData | WorkerEditFormData>({
    resolver: zodResolver(isEditing ? workerEditSchema : workerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      document_type: DEFAULT_DOCUMENT_TYPE,
      document_number: '',
      email: '',
      password: '',
      id_role: DEFAULT_USER_ROLE,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // Llenar el formulario cuando se está editando
  useEffect(() => {
    if (editingWorker) {
      reset({
        first_name: editingWorker.first_name || '',
        last_name: editingWorker.last_name || '',
        document_type: (editingWorker.document_type || DEFAULT_DOCUMENT_TYPE).toString(),
        document_number: editingWorker.document_number || '',
        email: editingWorker.email || '',
        password: '', // No mostrar la contraseña actual
        id_role: editingWorker.id_role || DEFAULT_USER_ROLE,
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        document_type: DEFAULT_DOCUMENT_TYPE,
        document_number: '',
        email: '',
        password: '',
        id_role: DEFAULT_USER_ROLE,
      });
    }
    setApiError('');
  }, [editingWorker, isOpen, reset]);

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

  const onFormSubmit: SubmitHandler<WorkerFormData | WorkerEditFormData> = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');

      let requestBody: { [key in keyof Worker]?: string | number };

      if (editingWorker) {
        // Solo enviar los campos que han cambiado
        requestBody = {};
        Object.keys(dirtyFields).forEach(field => {
          const key = field as keyof Worker;
          requestBody[key] = data[key as keyof typeof data];
        });
      } else {
        // Para crear, enviar todos los campos necesarios
        const createData = data as WorkerFormData;
        requestBody = {
          ...createData,
        };
      }

      let response;
      if (editingWorker) {
        // Actualizar usuario existente
        response = await api.put(`/user/update/${editingWorker.id}`, requestBody, {
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
        onSubmit(data as Omit<Worker, 'id'>);

        // Resetear formulario
        reset();
      } else {
        const action = editingWorker ? 'actualizar' : 'crear';
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
        title={editingWorker ? 'Editar usuario' : 'Añadir usuario'}
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
              Rol de usuario *
            </label>
            {editingWorker ? (
              <Input
                value={ADMIN_USER_ROLES.find(role => role.value === watch('id_role').toString())?.label || ''}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            ) : (
              <Select
                value={watch('id_role').toString()}
                options={ADMIN_USER_ROLES}
                onChange={(value: string) => {
                  setValue('id_role', parseInt(value));
                  clearErrors('id_role');
                }}
              />
            )}
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
              disabled={!!editingWorker}
              onChange={(e) => {
                setValue('email', e.target.value.toLowerCase(), { shouldDirty: true });
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
            {editingWorker && (
              <p className="text-gray-500 text-xs mt-1">El correo no puede ser modificado</p>
            )}
          </div>

          {!editingWorker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <PasswordInput
                value={watch('password') || ''}
                onChange={(value) => setValue('password', value)}
                placeholder="Ingrese la contraseña"
                disabled={isLoading}
                error={errors.password?.message}
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
                (editingWorker ? 'Actualizando...' : 'Guardando...') :
                (editingWorker ? 'Actualizar' : 'Guardar')
              }
            </Button>
          </ModalFooter>
        </form>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <DeliveryLoader message={editingWorker ? 'Actualizando trabajador...' : 'Guardando trabajador...'} />
          </div>
        )}
      </Modal>
    </>
  );
}
