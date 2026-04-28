'use client';

import { useState, useEffect } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import { User, Mail, Lock, Fingerprint, IdCard, Shield, CreditCard, AlertCircle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';
import DeliveryLoader from '@/components/ui/delivery-loader';
import Modal, { ModalFooter } from '@/components/ui/modal';

import { DOCUMENT_TYPES, DEFAULT_DOCUMENT_TYPE } from '@/constants/documentTypes';
import { USER_ROLES, DEFAULT_USER_ROLE } from '@/constants/userRoles';
import { workerSchema, workerEditSchema, type WorkerFormData, type WorkerEditFormData } from '@/lib/validations/worker';

import api from '@/app/services/api';

interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

// Roles de usuario específicos para usuarios internos (Admin, Almacén, Coordinación)
const ADMIN_USER_ROLES = USER_ROLES.filter(role =>
  role.value === 1 || role.value === 4 || role.value === 5
).map(role => ({
  value: role.value.toString(),
  label: role.label
}));

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

export default function WorkerModal({ isOpen, onClose, onSubmit, editingWorker }: Readonly<WorkerModalProps>) {
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

  const getRequestBody = (data: WorkerFormData | WorkerEditFormData) => {
    if (!isEditing) return { ...data };

    const body: Record<string, string | number> = {};
    Object.keys(dirtyFields).forEach(field => {
      const value = (data as any)[field];
      if (value !== undefined) {
        body[field] = value;
      }
    });
    return body;
  };

  const handleApiError = (error: any) => {
    console.error('Error al procesar usuario:', error);
    const status = error?.response?.status;
    const message = error?.response?.data?.message || 'Error del servidor. Intente nuevamente';

    if (status === 409) {
      setApiError('Ya existe un usuario con este correo');
    } else {
      setApiError(message);
    }
  };

  const onFormSubmit: SubmitHandler<WorkerFormData | WorkerEditFormData> = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');
      const requestBody = getRequestBody(data);
      const url = isEditing ? `/user/update/${editingWorker?.id}` : '/user';
      const response = await (isEditing ? api.put(url, requestBody, { headers: { authorization: `${token}` } }) : api.post(url, requestBody, { headers: { authorization: `${token}` } }));

      if (response.status === 200 || response.status === 201) {
        onSubmit({
          first_name: data.first_name,
          last_name: data.last_name,
          document_type: data.document_type,
          document_number: data.document_number,
          id_role: data.id_role,
          email: data.email || editingWorker?.email || '',
          password: data.password || '',
          status: editingWorker?.status ?? 1
        });
        reset();
      } else {
        const action = isEditing ? 'actualizar' : 'crear';
        setApiError(response.data?.message || `Error al ${action} el usuario`);
      }
    } catch (error: unknown) {
      handleApiError(error);
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

  const getSubmitButtonLabel = () => {
    if (isLoading) return isEditing ? 'Actualizando...' : 'Guardando...';
    return isEditing ? 'Guardar Cambios' : 'Crear Usuario';
  };

  const getLoaderMessage = () => isEditing ? 'Actualizando usuario...' : 'Guardando usuario...';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar usuario' : 'Añadir usuario'}
      description={isEditing ? 'Actualiza la información personal y de acceso del usuario.' : 'Completa los datos para registrar un nuevo usuario administrativo.'}
      size="lg"
      showCloseButton
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 relative">
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} className="shrink-0" />
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-[#02997d] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                <User size={14} />
              </div>
              Información Personal
            </h4>
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              label="Nombre *"
              size="compact"
              icon={User}
              placeholder="Ej: Juan"
              value={watch('first_name') || ''}
              onChange={(e) => setValue('first_name', e.target.value.toUpperCase(), { shouldDirty: true })}
              error={errors.first_name?.message}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
              autoFocus={!isEditing}
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              label="Apellido *"
              size="compact"
              icon={User}
              placeholder="Ej: Pérez"
              value={watch('last_name') || ''}
              onChange={(e) => setValue('last_name', e.target.value.toUpperCase(), { shouldDirty: true })}
              error={errors.last_name?.message}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          {/* SECCIÓN 2: IDENTIFICACIÓN */}
          <div className="md:col-span-2 border-t border-slate-100 mt-1 pt-4">
            <h4 className="text-xs font-bold text-[#02997d] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                <IdCard size={14} />
              </div>
              Identificación
            </h4>
          </div>

          <div className="space-y-1.5 font-sans">
            <Select
              label="Tipo de documento *"
              size="compact"
              icon={CreditCard}
              value={watch('document_type')}
              options={DOCUMENT_TYPES}
              onChange={(value: string) => {
                setValue('document_type', value);
                clearErrors('document_type');
                setValue('document_number', '');
                clearErrors('document_number');
              }}
              error={errors.document_type?.message}
              className="bg-white border-slate-200"
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              label="Número de documento *"
              size="compact"
              icon={Fingerprint}
              placeholder="Ej: 77665544"
              value={watch('document_number') || ''}
              onChange={(e) => setValue('document_number', e.target.value, { shouldDirty: true })}
              error={errors.document_number?.message}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          {/* SECCIÓN 3: DATOS DE CUENTA */}
          <div className="md:col-span-2 border-t border-slate-100 mt-1 pt-4">
            <h4 className="text-xs font-bold text-[#02997d] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                <Shield size={14} />
              </div>
              Datos de Cuenta y Acceso
            </h4>
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              type="email"
              label="Correo electrónico *"
              size="compact"
              icon={Mail}
              placeholder="nombre@empresa.com"
              value={watch('email') || ''}
              onChange={(e) => setValue('email', e.target.value.toLowerCase(), { shouldDirty: true })}
              error={errors.email?.message}
              autoComplete="username"
              disabled={isEditing}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
            {isEditing && (
              <p className="text-slate-400 text-[10px] uppercase font-bold mt-1.5 flex items-center gap-1.5 px-1">
                <Lock size={10} /> Registro verificado - No modificable
              </p>
            )}
          </div>

          <div className="space-y-1.5 font-sans">
            {isEditing ? (
              <Input
                label="Rol de usuario *"
                size="compact"
                icon={Shield}
                value={ADMIN_USER_ROLES.find(role => role.value === watch('id_role').toString())?.label || ''}
                disabled
                className="bg-slate-50 text-slate-500 border-slate-100"
              />
            ) : (
              <Select
                label="Rol de usuario *"
                size="compact"
                icon={Shield}
                value={watch('id_role').toString()}
                options={ADMIN_USER_ROLES}
                onChange={(value: string) => {
                  setValue('id_role', Number.parseInt(value));
                  clearErrors('id_role');
                }}
                error={errors.id_role?.message}
                className="bg-white border-slate-200"
              />
            )}
          </div>

          {!isEditing && (
            <div className="md:col-span-2 space-y-1.5 font-sans">
              <PasswordInput
                label="Contraseña *"
                size="compact"
                placeholder="********"
                value={watch('password') || ''}
                onChange={(e) => setValue('password', e.target.value)}
                disabled={isLoading}
                error={errors.password?.message}
                autoComplete="new-password"
                className="bg-white border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          )}
        </div>

        <ModalFooter className="pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="bg-white border text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || (isEditing && Object.keys(dirtyFields).length === 0)}
            className="min-w-[120px]"
          >
            {getSubmitButtonLabel()}
          </Button>
        </ModalFooter>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-2xl">
            <DeliveryLoader message={getLoaderMessage()} />
          </div>
        )}
      </form>
    </Modal>
  );
}
