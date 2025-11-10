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
            {editingWorker ? (
              <Input
                label="Rol de usuario *"
                value={ADMIN_USER_ROLES.find(role => role.value === watch('id_role').toString())?.label || ''}
                disabled
                size='compact'
              />
            ) : (
              <Select
                label="Rol de usuario *"
                value={watch('id_role').toString()}
                options={ADMIN_USER_ROLES}
                onChange={(value: string) => {
                  setValue('id_role', parseInt(value));
                  clearErrors('id_role');
                }}
                error={errors.id_role?.message}
                size='compact'
              />
            )}
          </div>

          <div>
            <Input
              label="Nombre *"
              size='compact'
              placeholder="Ingrese el nombre"
              error={errors.first_name?.message}
              value={watch('first_name') || ''}
              onChange={(value) => {
                setValue('first_name', value.toUpperCase(), { shouldDirty: true });
              }}
            />
          </div>

          <div>
            <Input
              label="Apellido *"
              size='compact'
              placeholder="Ingrese el apellido"
              error={errors.last_name?.message}
              value={watch('last_name') || ''}
              onChange={(value) => {
                setValue('last_name', value.toUpperCase(), { shouldDirty: true });
              }}
            />
          </div>

          <div>
            <Select
              label="Tipo de documento *"
              value={watch('document_type')}
              size='compact'
              options={DOCUMENT_TYPES}
              error={errors.document_type?.message}
              onChange={(value: string) => {
                setValue('document_type', value);
                clearErrors('document_type');
                // Limpiar el número de documento cuando cambie el tipo
                setValue('document_number', '');
                clearErrors('document_number');
              }}
            />
          </div>

          <div>
            <Input
              size='compact'
              label="Número de documento *"
              placeholder="Ingrese el número de documento"
              error={errors.document_number?.message}
              value={watch('document_number') || ''}
              onChange={(value) => {
                setValue('document_number', value, { shouldDirty: true });
              }}
            />
          </div>

          <div>
            <Input
              type="email"
              label="Correo electrónico *"
              size='compact'
              placeholder="Ingrese el correo electrónico"
              error={errors.email?.message}
              autoComplete="username"
              disabled={!!editingWorker}
              value={watch('email') || ''}
              onChange={(value) => {
                setValue('email', value.toLowerCase(), { shouldDirty: true });
              }}
            />
            {editingWorker && (
              <p className="text-gray-500 text-xs mt-1">El correo no puede ser modificado</p>
            )}
          </div>

          {!editingWorker && (
            <div>
              <PasswordInput
                label="Contraseña *"
                size='compact'
                value={watch('password') || ''}
                onChange={(value) => setValue('password', value)}
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
