'use client';

import { useState, useEffect } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import { User, Mail, Lock, Truck, Fingerprint, IdCard, Gauge, Car, Shield, CreditCard } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

import api from '@/app/services/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';
import Modal, { ModalFooter } from '@/components/ui/modal';
import DeliveryLoader from '@/components/ui/delivery-loader';

import { PERSONAL_DOCUMENT_TYPES, DEFAULT_DOCUMENT_TYPE } from '@/constants/documentTypes';
import { DEFAULT_CARRIER_ROLE } from '@/constants/userRoles';
import { VEHICLE_TYPES } from '@/constants/formOptions';

import { carrierSchema, carrierEditSchema, type CarrierFormData, type CarrierEditFormData } from '@/lib/validations/carrier';

interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

interface Carrier {
  id?: number;
  document_number: string;
  document_type: string;
  email: string;
  first_name: string;
  last_name: string | null;
  license: string;
  brand: string;
  model: string;
  plate_number: string;
  vehicle_type: string;
  password: string;
  status: number;
  id_role: number;
}

interface CarrierUser {
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  id_role?: number;
}

interface CarrierVehicle {
  vehicle_type: string;
  brand: string;
  model: string;
  plate_number: string;
  license: string;
}

interface CarrierRequestBody {
  user: CarrierUser;
  vehicle: CarrierVehicle;
}

interface CarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (carrier: Omit<Carrier, 'id'>) => void;
  editingCarrier?: Carrier | null;
}

export default function CarrierModal({ isOpen, onClose, onSubmit, editingCarrier }: Readonly<CarrierModalProps>) {
  const isEditing = !!editingCarrier;

  const {
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
      model: '',
      plate_number: '',
      vehicle_type: 'MOTOCICLETA',
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
        model: editingCarrier.model || '',
        plate_number: editingCarrier.plate_number || '',
        vehicle_type: (editingCarrier.vehicle_type as 'MOTOCICLETA' | 'AUTO' | 'BICICLETA' | 'OTRO') || 'MOTOCICLETA',
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
        model: '',
        plate_number: '',
        vehicle_type: 'MOTOCICLETA',
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

  const getRequestBody = (data: CarrierFormData | CarrierEditFormData): CarrierRequestBody => {
    if (editingCarrier) {
      const user: Partial<CarrierUser> = {};
      const vehicle: Partial<CarrierVehicle> = {};
      Object.keys(dirtyFields).forEach(field => {
        if (['first_name', 'last_name', 'document_type', 'document_number', 'email', 'password'].includes(field)) {
          user[field as keyof CarrierUser] = (data as any)[field];
        } else if (['vehicle_type', 'brand', 'model', 'plate_number', 'license'].includes(field)) {
          vehicle[field as keyof CarrierVehicle] = (data as any)[field];
        }
      });
      return { user: user as CarrierUser, vehicle: vehicle as CarrierVehicle };
    }

    const createData = data as CarrierFormData;
    return {
      user: {
        first_name: createData.first_name,
        last_name: createData.last_name,
        document_type: createData.document_type,
        document_number: createData.document_number,
        email: createData.email,
        password: createData.password,
        id_role: DEFAULT_CARRIER_ROLE,
      },
      vehicle: {
        vehicle_type: createData.vehicle_type,
        brand: createData.brand,
        model: createData.model,
        plate_number: createData.plate_number,
        license: createData.license,
      }
    };
  };

  const handleApiError = (error: unknown) => {
    console.error('Error al procesar transportista:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError;
      setApiError(axiosError.response?.data?.message || 'Error del servidor. Intente nuevamente');
    } else {
      setApiError('Error del servidor. Intente nuevamente');
    }
  };

  const getSubmitData = (data: CarrierFormData | CarrierEditFormData): Omit<Carrier, 'id'> => ({
    first_name: data.first_name || editingCarrier?.first_name || '',
    last_name: data.last_name || editingCarrier?.last_name || '',
    document_type: data.document_type || editingCarrier?.document_type || '',
    document_number: data.document_number || editingCarrier?.document_number || '',
    email: data.email || editingCarrier?.email || '',
    password: ('password' in data ? data.password : '') || '',
    vehicle_type: data.vehicle_type || editingCarrier?.vehicle_type || '',
    brand: data.brand || editingCarrier?.brand || '',
    model: data.model || editingCarrier?.model || '',
    plate_number: data.plate_number || editingCarrier?.plate_number || '',
    license: data.license || editingCarrier?.license || '',
    status: editingCarrier?.status ?? 0,
    id_role: DEFAULT_CARRIER_ROLE
  });

  const onFormSubmit: SubmitHandler<CarrierFormData | CarrierEditFormData> = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');
      const requestBody = getRequestBody(data);
      const url = editingCarrier ? `/user/update/${editingCarrier.id}` : '/user/courier';
      const response = await (editingCarrier ? api.put(url, requestBody, { headers: { authorization: `${token}` } }) : api.post(url, requestBody, { headers: { authorization: `${token}` } }));

      if (response.status === 200 || response.status === 201) {
        onSubmit(getSubmitData(data));
        reset();
      } else {
        const action = editingCarrier ? 'actualizar' : 'crear';
        setApiError(response.data?.message || `Error al ${action} el transportista`);
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
    if (isLoading) return editingCarrier ? 'Actualizando...' : 'Guardando...';
    return editingCarrier ? 'Guardar Cambios' : 'Crear Transportista';
  };

  const getLoaderMessage = () => editingCarrier ? 'Actualizando...' : 'Guardando...';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCarrier ? 'Editar transportista' : 'Añadir transportista'}
      description={editingCarrier ? 'Actualiza la información personal y del vehículo del transportista.' : 'Completa los datos para registrar un nuevo transportista en la plataforma.'}
      size="xl"
      showCloseButton
    >

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 relative">
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

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
              error={errors.first_name?.message}
              value={watch('first_name') || ''}
              onChange={(e) => {
                setValue('first_name', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
              autoFocus={!editingCarrier}
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              label="Apellido *"
              size="compact"
              icon={User}
              placeholder="Ej: Pérez"
              error={errors.last_name?.message}
              value={watch('last_name') || ''}
              onChange={(e) => {
                setValue('last_name', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>

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
              value={watch('document_type')}
              size="compact"
              icon={CreditCard}
              options={[...PERSONAL_DOCUMENT_TYPES]}
              error={errors.document_type?.message}
              className="bg-white border-slate-200"
              onChange={(value: string) => {
                setValue('document_type', value);
                clearErrors('document_type');
                setValue('document_number', '');
                clearErrors('document_number');
              }}
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              size="compact"
              icon={Fingerprint}
              label="Número de documento *"
              placeholder="Ingrese número"
              error={errors.document_number?.message}
              value={watch('document_number') || ''}
              onChange={(e) => {
                setValue('document_number', e.target.value, { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="md:col-span-2 border-t border-slate-100 mt-1 pt-4">
            <h4 className="text-xs font-bold text-[#02997d] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                <Shield size={14} />
              </div>
              Datos de Cuenta
            </h4>
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              type="email"
              label="Correo electrónico *"
              size="compact"
              icon={Mail}
              placeholder="nombre@empresa.com"
              error={errors.email?.message}
              autoComplete="username"
              disabled={!!editingCarrier}
              value={watch('email') || ''}
              onChange={(e) => {
                setValue('email', e.target.value.toLowerCase(), { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
            {editingCarrier && (
              <p className="text-slate-400 text-[10px] uppercase font-bold mt-1.5 flex items-center gap-1.5 px-1">
                <Lock size={10} /> Registro verificado - No modificable
              </p>
            )}
          </div>

          <div className="space-y-1.5 font-sans">
            {!editingCarrier && (
              <PasswordInput
                label="Contraseña *"
                size="compact"
                value={watch('password') || ''}
                onChange={(e) => setValue('password', e.target.value)}
                disabled={isLoading}
                error={'password' in errors ? (errors.password as any)?.message : undefined}
                autoComplete="new-password"
                className="bg-white border-slate-200 focus:bg-white transition-colors"
              />
            )}
          </div>

          {/* SECCIÓN 2: INFORMACIÓN DEL VEHÍCULO */}
          <div className="md:col-span-2 border-t border-slate-100 mt-1 pt-4">
            <h4 className="text-xs font-bold text-[#02997d] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                <Truck size={14} />
              </div>
              Información del Vehículo
            </h4>
          </div>

          <div className="space-y-1.5 font-sans">
            <Select
              label="Tipo de vehículo *"
              value={watch('vehicle_type')}
              size="compact"
              icon={Truck}
              options={[...VEHICLE_TYPES]}
              error={errors.vehicle_type?.message}
              className="bg-white border-slate-200"
              onChange={(value: string) => {
                setValue('vehicle_type', value, { shouldDirty: true });
              }}
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              label="Marca *"
              size="compact"
              icon={Car}
              placeholder="Ej: Toyota"
              error={errors.brand?.message}
              value={watch('brand') || ''}
              onChange={(e) => {
                setValue('brand', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              label="Modelo *"
              size="compact"
              icon={Car}
              placeholder="Ej: Hilux"
              error={errors.model?.message}
              value={watch('model') || ''}
              onChange={(e) => {
                setValue('model', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <Input
              label="Placa *"
              size="compact"
              icon={Gauge}
              placeholder="Ej: ABC-123"
              error={errors.plate_number?.message}
              value={watch('plate_number') || ''}
              onChange={(e) => {
                setValue('plate_number', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5 font-sans">
            <Input
              label="Licencia de conducir *"
              size="compact"
              icon={IdCard}
              placeholder="Ej: Q12345678"
              error={errors.license?.message}
              value={watch('license') || ''}
              onChange={(e) => {
                setValue('license', e.target.value.toUpperCase(), { shouldDirty: true });
              }}
              className="bg-white border-slate-200 focus:bg-white transition-colors"
            />
          </div>
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
            {getSubmitButtonLabel()}
          </Button>
        </ModalFooter>
      </form>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-2xl">
          <DeliveryLoader message={getLoaderMessage()} />
        </div>
      )}
    </Modal>
  );
}
