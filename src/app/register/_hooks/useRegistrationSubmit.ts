'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import api from '@/app/services/api';
import { RegisterFormData } from '@/lib/validations/auth';

interface UseRegistrationSubmitProps {
  paymentMethod: 'bank' | 'app' | null;
  form: UseFormReturn<RegisterFormData>;
  onSuccess: () => void;
  onError: (title: string, message: string) => void;
}

export function useRegistrationSubmit({
  paymentMethod,
  form,
  onSuccess,
  onError
}: UseRegistrationSubmitProps) {
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] = useState(false);
  const { watch } = form;

  // Función para transformar los datos según el método de pago
  const transformFormData = (data: RegisterFormData) => {
    return {
      user: data.user,
      company: {
        company_name: data.company.company_name,
        addresses: data.company.addresses.map(address => ({
          address: address.address,
          id_region: address.id_region,
          id_district: address.id_district,
          // Solo incluir id_sector si es diferente de 0
          ...(address.id_sector && address.id_sector !== 0 ? { id_sector: address.id_sector } : {})
        })),
        phones: data.company.phones,
        ruc: data.company.ruc,
        // Solo incluir el método de pago seleccionado
        ...(paymentMethod === 'bank'
          ? { bank_accounts: data.company.bank_accounts }
          : { payment_apps: data.company.payment_apps }
        )
      }
    };
  };

  // Función para manejar errores de la API
  const handleApiError = (error: unknown) => {
    console.error('Error al registrar:', error);

    let errorMsg = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
    let errorTitleMsg = 'Error en el Registro';

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string } } };
      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 400:
            errorTitleMsg = 'Datos inválidos';
            errorMsg = axiosError.response.data?.message || 'Los datos ingresados no son válidos. Por favor, verifica la información y vuelve a intentarlo.';
            break;
          case 409:
            errorTitleMsg = 'Registro duplicado';
            errorMsg = 'Ya existe una empresa registrada con este email. Por favor, verifica los datos o utiliza información diferente.';
            break;
          case 422:
            errorTitleMsg = 'Datos incompletos';
            errorMsg = 'Algunos datos están incompletos o son inválidos. Por favor, revisa todos los campos del formulario.';
            break;
          case 500:
            errorTitleMsg = 'Error del servidor';
            errorMsg = 'Ocurrió un error interno en nuestros servidores. Por favor, intenta nuevamente en unos momentos.';
            break;
          default:
            errorTitleMsg = 'Error del servidor';
            errorMsg = `Error del servidor (código ${axiosError.response.status}). Si el problema persiste, contacta al soporte técnico.`;
        }
      } else {
        errorTitleMsg = 'Sin Conexión';
        errorMsg = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.';
      }
    }

    onError(errorTitleMsg, errorMsg);
  };

  // Función principal para enviar el registro
  const handleConfirmSubmit = async () => {
    try {
      setIsSubmittingConfirmation(true);

      const data = watch(); // Obtener todos los datos del formulario
      console.log('Datos del formulario:', data);

      const transformedData = transformFormData(data);
      console.log('Datos transformados para la API:', transformedData);

      // Llamada a la API para enviar los datos al servidor
      const response = await api.post('/user/company', transformedData);

      if (response.data) {
        setIsSubmittingConfirmation(false);
        onSuccess();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error: unknown) {
      setIsSubmittingConfirmation(false);
      handleApiError(error);
    }
  };

  return {
    handleConfirmSubmit,
    isSubmittingConfirmation
  };
}