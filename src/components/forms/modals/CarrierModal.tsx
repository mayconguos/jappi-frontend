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
              <Input
                type="email"
                label="Correo electrónico *"
                size="compact"
                value={watch('email') || ''}
                onChange={(value) => {
                  setValue('email', value.toLowerCase(), { shouldDirty: true });
                }}
                error={errors.email?.message}
                autoComplete="username"
                disabled={!!editingCarrier}
              />
              {editingCarrier && <p className="text-gray-500 text-xs mt-1">El correo no puede ser modificado</p>}
            </div>
            {!editingCarrier && (
              <div>
                <PasswordInput
                  label="Contraseña *"
                  size="compact"
                  value={watch('password') || ''}
                  onChange={(value) => setValue('password', value)}
                  disabled={isLoading}
                  error={'password' in errors ? errors.password?.message : undefined}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Fila 2: Nombre | Apellido */}
            <div>
              <Input
                label="Nombre *"
                size="compact"
                value={watch('first_name') || ''}
                onChange={(value) => {
                  setValue('first_name', value.toUpperCase(), { shouldDirty: true });
                }}
                error={errors.first_name?.message}
              />
            </div>
            <div>
              <Input
                label="Apellido *"
                size="compact"
                value={watch('last_name') || ''}
                onChange={(value) => {
                  setValue('last_name', value.toUpperCase(), { shouldDirty: true });
                }}
                error={errors.last_name?.message}
              />
            </div>

            {/* Fila 3: Tipo documento | Número de documento */}
            <div>
              <Select
                label="Tipo de documento *"
                size="compact"
                value={watch('document_type')}
                options={PERSONAL_DOCUMENT_TYPES}
                onChange={(value: string) => {
                  setValue('document_type', value);
                  clearErrors('document_type');
                  setValue('document_number', '');
                  clearErrors('document_number');
                }}
                error={errors.document_type?.message}
              />
            </div>
            <div>
              <Input
                label="Número de documento *"
                size="compact"
                value={watch('document_number') || ''}
                onChange={(value) => {
                  setValue('document_number', value, { shouldDirty: true });
                }}
                error={errors.document_number?.message}
              />
            </div>

            {/* Fila 4: Tipo de vehículo | Marca */}
            <div className="md:col-span-1">
              <Select
                label="Tipo de vehículo *"
                size="compact"
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
                error={errors.vehicle_type?.message}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="Marca *"
                size="compact"
                value={watch('brand') || ''}
                onChange={(value) => {
                  setValue('brand', value.toUpperCase(), { shouldDirty: true });
                }}
                error={errors.brand?.message}
              />
            </div>

            {/* Fila 5: Modelo | Placa */}
            <div className="md:col-span-1">
              <Input
                label="Modelo *"
                size="compact"
                value={watch('model') || ''}
                onChange={(value) => {
                  setValue('model', value.toUpperCase(), { shouldDirty: true });
                }}
                error={errors.model?.message}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="Placa *"
                size="compact"
                value={watch('plate_number') || ''}
                onChange={(value) => {
                  setValue('plate_number', value.toUpperCase(), { shouldDirty: true });
                }}
                error={errors.plate_number?.message}
              />
            </div>

            {/* Fila 6: Licencia */}
            <div className="md:col-span-1">
              <Input
                label="Licencia *"
                size="compact"
                value={watch('license') || ''}
                onChange={(value) => {
                  setValue('license', value, { shouldDirty: true });
                }}
                error={errors.license?.message}
              />
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
