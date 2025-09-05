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

import { PERSONAL_DOCUMENT_TYPES, DEFAULT_DOCUMENT_TYPE } from '@/constants/documentTypes';
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

  const onFormSubmit: SubmitHandler<CarrierFormData | CarrierEditFormData> = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');

      let requestBody: CarrierRequestBody;

      if (editingCarrier) {
        // Solo enviar los campos que han cambiado, agrupados en user y vehicle
        const user: Partial<CarrierUser> = {};
        const vehicle: Partial<CarrierVehicle> = {};
        Object.keys(dirtyFields).forEach(field => {
          if ([
            'first_name', 'last_name', 'document_type', 'document_number', 'email', 'password'
          ].includes(field)) {
            (user as Partial<CarrierUser>)[field as keyof CarrierUser] = data[field as keyof typeof data] as string;
          } else if ([
            'vehicle_type', 'brand', 'model', 'plate_number', 'license'
          ].includes(field)) {
            (vehicle as Partial<CarrierVehicle>)[field as keyof CarrierVehicle] = data[field as keyof typeof data] as string;
          }
        });
        requestBody = {
          user: user as CarrierUser,
          vehicle: vehicle as CarrierVehicle,
        };
      } else {
        // Para crear, enviar todos los campos necesarios agrupados en user y vehicle
        const createData = data as CarrierFormData;
        requestBody = {
          user: {
            first_name: createData.first_name,
            last_name: createData.last_name,
            document_type: createData.document_type,
            document_number: createData.document_number,
            email: createData.email,
            password: createData.password,
          },
          vehicle: {
            vehicle_type: createData.vehicle_type,
            brand: createData.brand,
            model: createData.model,
            plate_number: createData.plate_number,
            license: createData.license,
          }
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
        size="xl"
        showCloseButton
      >

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 relative">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded col-span-2">
              {apiError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fila 1: Correo | Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
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
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              {editingCarrier && <p className="text-gray-500 text-xs mt-1">El correo no puede ser modificado</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
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

            {/* Fila 2: Nombre | Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <Input
                {...register('first_name')}
                placeholder="Ingrese el nombre"
                className={errors.first_name ? 'border-red-500' : ''}
                onChange={(e) => {
                  setValue('first_name', e.target.value.toUpperCase(), { shouldDirty: true });
                }}
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <Input
                {...register('last_name')}
                placeholder="Ingrese el apellido"
                className={errors.last_name ? 'border-red-500' : ''}
                onChange={(e) => {
                  setValue('last_name', e.target.value.toUpperCase(), { shouldDirty: true });
                }}
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>

            {/* Fila 3: Tipo documento | Número de documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento *</label>
              <Select
                value={watch('document_type')}
                options={PERSONAL_DOCUMENT_TYPES}
                onChange={(value: string) => {
                  setValue('document_type', value);
                  clearErrors('document_type');
                  setValue('document_number', '');
                  clearErrors('document_number');
                }}
              />
              {errors.document_type && <p className="text-red-500 text-xs mt-1">{errors.document_type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de documento *</label>
              <Input
                {...register('document_number')}
                placeholder="Ingrese el número de documento"
                className={errors.document_number ? 'border-red-500' : ''}
              />
              {errors.document_number && <p className="text-red-500 text-xs mt-1">{errors.document_number.message}</p>}
            </div>

            {/* Fila 4: Tipo de vehículo | Marca | Placa | Licencia */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vehículo *</label>
              <Select
                value={watch('vehicle_type')}
                options={[
                  { value: 'MOTOCICLETA', label: 'MOTOCICLETA' },
                  { value: 'AUTO', label: 'AUTO' },
                  { value: 'BICICLETA', label: 'BICICLETA' },
                  { value: 'OTRO', label: 'OTRO' },
                ]}
                onChange={(value: string) => {
                  setValue('vehicle_type', value as 'MOTOCICLETA' | 'AUTO' | 'BICICLETA' | 'OTRO');
                  clearErrors('vehicle_type');
                }}
              />
              {errors.vehicle_type && <p className="text-red-500 text-xs mt-1">{errors.vehicle_type.message}</p>}
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <Input
                {...register('brand')}
                placeholder="Ingrese la marca"
                className={errors.brand ? 'border-red-500' : ''}
                onChange={(e) => {
                  setValue('brand', e.target.value.toUpperCase(), { shouldDirty: true });
                }}
              />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <Input
                {...register('model')}
                placeholder="Ingrese el modelo"
                className={errors.model ? 'border-red-500' : ''}
                onChange={(e) => {
                  setValue('model', e.target.value.toUpperCase(), { shouldDirty: true });
                }}
              />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
              <Input
                {...register('plate_number')}
                placeholder="Ingrese la placa"
                className={errors.plate_number ? 'border-red-500' : ''}
                onChange={(e) => {
                  setValue('plate_number', e.target.value.toUpperCase(), { shouldDirty: true });
                }}
              />
              {errors.plate_number && <p className="text-red-500 text-xs mt-1">{errors.plate_number.message}</p>}
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Licencia *</label>
              <Input
                {...register('license')}
                placeholder="Ingrese la licencia"
                className={errors.license ? 'border-red-500' : ''}
              />
              {errors.license && <p className="text-red-500 text-xs mt-1">{errors.license.message}</p>}
            </div>
          </div>
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
