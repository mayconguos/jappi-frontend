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
        size="lg"
        showCloseButton
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span className="block w-1.5 h-1.5 rounded-full bg-red-600 mb-0.5" />
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Grupo 1: Nombre */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--surface-dark)] rounded-full"></span>
                Información Personal
              </h4>
            </div>

            <div className="space-y-1.5">
              <Input
                label="Nombre *"
                size='compact'
                placeholder="Ej: Juan"
                error={errors.first_name?.message}
                value={watch('first_name') || ''}
                onChange={(e) => {
                  setValue('first_name', e.target.value.toUpperCase(), { shouldDirty: true });
                }}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                autoFocus={!editingWorker}
              />
            </div>

            <div className="space-y-1.5">
              <Input
                label="Apellido *"
                size='compact'
                placeholder="Ej: Pérez"
                error={errors.last_name?.message}
                value={watch('last_name') || ''}
                onChange={(e) => {
                  setValue('last_name', e.target.value.toUpperCase(), { shouldDirty: true });
                }}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="md:col-span-2 border-t border-slate-100 my-1 pt-3">
              <h4 className="text-sm font-medium text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--surface-dark)] rounded-full"></span>
                Identificación
              </h4>
            </div>

            {/* Grupo 2: Documento */}
            <div className="space-y-1.5">
              <Select
                label="Tipo de documento *"
                value={watch('document_type')}
                size='compact'
                options={DOCUMENT_TYPES}
                error={errors.document_type?.message}
                className="bg-slate-50 border-slate-200"
                onChange={(value: string) => {
                  setValue('document_type', value);
                  clearErrors('document_type');
                  setValue('document_number', '');
                  clearErrors('document_number');
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Input
                size='compact'
                label="Número de documento *"
                placeholder="Ingrese número"
                error={errors.document_number?.message}
                value={watch('document_number') || ''}
                onChange={(e) => {
                  setValue('document_number', e.target.value, { shouldDirty: true });
                }}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="md:col-span-2 border-t border-slate-100 my-1 pt-3">
              <h4 className="text-sm font-medium text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--surface-dark)] rounded-full"></span>
                Datos de Cuenta
              </h4>
            </div>

            {/* Grupo 3: Cuenta */}
            <div className="space-y-1.5">
              <Input
                type="email"
                label="Correo electrónico *"
                size='compact'
                placeholder="nombre@empresa.com"
                error={errors.email?.message}
                autoComplete="username"
                disabled={!!editingWorker}
                value={watch('email') || ''}
                onChange={(e) => {
                  setValue('email', e.target.value.toLowerCase(), { shouldDirty: true });
                }}
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
              {editingWorker && (
                <p className="text-slate-400 text-xs ml-1 flex items-center gap-1">
                  <span>🔒</span> El correo no se puede editar
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              {editingWorker ? (
                <Input
                  label="Rol de usuario *"
                  value={ADMIN_USER_ROLES.find(role => role.value === watch('id_role').toString())?.label || ''}
                  disabled
                  size='compact'
                  className="bg-slate-100 text-slate-500 border-transparent"
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
                  className="bg-slate-50 border-slate-200"
                />
              )}
            </div>

            {/* Grupo 4: Contraseña */}
            {!editingWorker && (
              <div className="md:col-span-2 space-y-1.5">
                <PasswordInput
                  label="Contraseña *"
                  size='compact'
                  value={watch('password') || ''}
                  onChange={(e) => setValue('password', e.target.value)}
                  disabled={isLoading}
                  error={errors.password?.message}
                  autoComplete="new-password"
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            )}
          </div>

          <ModalFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || (isEditing && Object.keys(dirtyFields).length === 0)}
              className="min-w-[120px]"
            >
              {isLoading ?
                (editingWorker ? 'Actualizando...' : 'Guardando...') :
                (editingWorker ? 'Guardar Cambios' : 'Crear Usuario')
              }
            </Button>
          </ModalFooter>
        </form>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
            <DeliveryLoader message={editingWorker ? 'Actualizando...' : 'Guardando...'} />
          </div>
        )}
      </Modal>
    </>
  );
}
