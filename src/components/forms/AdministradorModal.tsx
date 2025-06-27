'use client';

import { useState, useEffect } from 'react';

import api from '@/app/services/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { DOCUMENT_TYPES, DEFAULT_DOCUMENT_TYPE } from '@/constants/documentTypes';
import { USER_TYPES, DEFAULT_USER_TYPE } from '@/constants/userTypes';

interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

// Tipos de usuario específicos para administradores
const ADMIN_USER_TYPES = USER_TYPES.filter(type =>
  type.value === 2 || type.value === 4 || type.value === 5
).map(type => ({
  value: type.value.toString(),
  label: type.label
})); // Admin, Almacén, Coordinación

interface Administrador {
  id?: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  type: number;
}

interface AdministradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (administrador: Omit<Administrador, 'id'>) => void;
  editingAdministrador?: Administrador | null;
}

export default function AdministradorModal({ isOpen, onClose, onSubmit, editingAdministrador }: AdministradorModalProps) {
  const [formData, setFormData] = useState<Administrador>({
    first_name: '',
    last_name: '',
    document_type: DEFAULT_DOCUMENT_TYPE,
    document_number: '',
    email: '',
    password: '',
    type: DEFAULT_USER_TYPE,
  });

  const [errors, setErrors] = useState<Partial<Administrador>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [changedFields, setChangedFields] = useState<Set<keyof Administrador>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (field: keyof Administrador, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'type' ? parseInt(value) : value
    }));

    // Marcar el campo como cambiado si es que estamos editando
    if (editingAdministrador) {
      setChangedFields(prev => new Set(prev).add(field));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Llenar el formulario cuando se está editando
  useEffect(() => {
    if (editingAdministrador) {
      setFormData({
        first_name: editingAdministrador.first_name || '',
        last_name: editingAdministrador.last_name || '',
        document_type: (editingAdministrador.document_type || DEFAULT_DOCUMENT_TYPE).toString(),
        document_number: editingAdministrador.document_number || '',
        email: editingAdministrador.email || '',
        password: '', // No mostrar la contraseña actual
        type: editingAdministrador.type || DEFAULT_USER_TYPE,
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        document_type: DEFAULT_DOCUMENT_TYPE,
        document_number: '',
        email: '',
        password: '',
        type: DEFAULT_USER_TYPE,
      });
    }
    setErrors({});
    setApiError('');
    setChangedFields(new Set());
  }, [editingAdministrador, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Administrador> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }
    if (!formData.document_number.trim()) {
      newErrors.document_number = 'El número de documento es requerido';
    } else {
      // Validaciones específicas por tipo de documento
      if (formData.document_type === '1') { // DNI
        const dniPattern = /^\d{8}$/;
        if (!dniPattern.test(formData.document_number)) {
          newErrors.document_number = 'El DNI debe tener exactamente 8 dígitos numéricos';
        }
      } else if (formData.document_type === '6') { // RUC
        const rucPattern = /^\d{11}$/;
        if (!rucPattern.test(formData.document_number)) {
          newErrors.document_number = 'El RUC debe tener exactamente 11 dígitos numéricos';
        }
      } else if (formData.document_type === '4' || formData.document_type === '7') { // Carnet de extranjería o Pasaporte
        const cePassportPattern = /^[A-Za-z0-9]{1,12}$/;
        if (!cePassportPattern.test(formData.document_number)) {
          const docType = formData.document_type === '4' ? 'Carnet de extranjería' : 'Pasaporte';
          newErrors.document_number = `El ${docType} debe tener máximo 12 caracteres alfanuméricos`;
        }
      } else if (formData.document_type === '0' || formData.document_type === 'A') { // Otros o Cédula Diplomática
        const generalPattern = /^[A-Za-z0-9\-\s]{1,15}$/;
        if (!generalPattern.test(formData.document_number)) {
          const docType = formData.document_type === '0' ? 'documento' : 'Cédula Diplomática';
          newErrors.document_number = `El ${docType} debe tener máximo 15 caracteres alfanuméricos`;
        }
      }
    }

    // Solo validar email si no estamos editando
    if (!editingAdministrador) {
      if (!formData.email.trim()) {
        newErrors.email = 'El correo electrónico es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'El correo electrónico no es válido';
      }
    }

    // Solo validar contraseña si no estamos editando
    if (!editingAdministrador) {
      if (!formData.password.trim()) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      setApiError('');

      try {
        const token = localStorage.getItem('token');

        let requestBody: { [key in keyof Administrador]?: string | number };

        if (editingAdministrador) {
          // Solo enviar los campos que han cambiado
          requestBody = {};
          changedFields.forEach(field => {
            requestBody[field] = formData[field];
          });
        } else {
          // Para crear, enviar todos los campos necesarios
          requestBody = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            document_type: formData.document_type,
            document_number: formData.document_number,
            type: formData.type,
            email: formData.email,
            password: formData.password
          };
        }

        let response;
        if (editingAdministrador) {
          // Actualizar administrador existente
          response = await api.put(`/user/update/${editingAdministrador.id}`, requestBody, {
            headers: {
              authorization: `${token}`,
            },
          });
        } else {
          // Crear nuevo administrador
          response = await api.post('/user/create', requestBody, {
            headers: {
              authorization: `${token}`,
            },
          });
        }

        if (response.status === 200 || response.status === 201) {
          onSubmit(formData);

          // Resetear formulario
          setFormData({
            first_name: '',
            last_name: '',
            document_type: DEFAULT_DOCUMENT_TYPE,
            document_number: '',
            email: '',
            password: '',
            type: DEFAULT_USER_TYPE,
          });
          setErrors({});
          setChangedFields(new Set());

          // Mostrar modal de éxito solo para actualizaciones
          if (editingAdministrador) {
            setShowSuccessModal(true);
          } else {
            onClose();
          }
        } else {
          const action = editingAdministrador ? 'actualizar' : 'crear';
          setApiError(response.data?.message || `Error al ${action} el administrador`);
        }
      } catch (error: unknown) {
        console.error('Error al procesar administrador:', error);

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
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      document_type: DEFAULT_DOCUMENT_TYPE,
      document_number: '',
      email: '',
      password: '',
      type: DEFAULT_USER_TYPE,
    });
    setErrors({});
    setApiError('');
    setChangedFields(new Set());
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
              La información del administrador ha sido actualizada correctamente.
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
            {editingAdministrador ? 'Editar administrador' : 'Añadir administrador'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.type.toString()}
              onChange={(value: string) => handleChange('type', value)}
              options={ADMIN_USER_TYPES}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <Input
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              placeholder="Ingrese el nombre"
              className={errors.first_name ? 'border-red-500' : ''}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <Input
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              placeholder="Ingrese el apellido"
              className={errors.last_name ? 'border-red-500' : ''}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de documento *
            </label>
            <Select
              value={formData.document_type}
              onChange={(value: string) => handleChange('document_type', value)}
              options={DOCUMENT_TYPES}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de documento *
            </label>
            <Input
              value={formData.document_number}
              onChange={(e) => handleChange('document_number', e.target.value)}
              placeholder="Ingrese el número de documento"
              className={errors.document_number ? 'border-red-500' : ''}
            />
            {errors.document_number && (
              <p className="text-red-500 text-xs mt-1">{errors.document_number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ingrese el correo electrónico"
              className={errors.email ? 'border-red-500' : ''}
              autoComplete="username"
              disabled={!!editingAdministrador}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
            {editingAdministrador && (
              <p className="text-gray-500 text-xs mt-1">El correo no puede ser modificado</p>
            )}
          </div>

          {!editingAdministrador && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Ingrese la contraseña"
                className={errors.password ? 'border-red-500' : ''}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
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
                (editingAdministrador ? 'Actualizando...' : 'Guardando...') :
                (editingAdministrador ? 'Actualizar' : 'Guardar')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
