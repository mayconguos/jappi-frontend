'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { shipmentSchema, type ShipmentFormData } from '@/lib/validations/shipment';
import { useStepper } from '@/hooks';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';
import Stepper from '@/components/ui/stepper';
import StepNavigation from './_components/StepNavigation';
import RecipientSection from './_components/RecipientSection';
import ShipmentSection from './_components/ShipmentSection';
import PaymentSection from './_components/PaymentSection';

export default function CreateShipmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productsData, setProductsData] = useState<{
    pickup: Array<{ description: string; quantity: number; id: string }>;
    warehouse: Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>;
  }>({
    pickup: [],
    warehouse: []
  });

  // Hook para validación de ubicaciones
  const { getSectorOptions } = useLocationCatalog();

  // Configuración inicial del stepper (se ajustará dinámicamente)
  const { currentStep, nextStep, prevStep, isFirstStep, goToStep } = useStepper({
    totalSteps: 3
  });

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    mode: 'onChange',
    defaultValues: {
      // Datos del remitente (prellenados, ya que mencionas que ya los tienes)
      sender: {
        full_name: 'EMPRESA REMITENTE', // Esto debería venir de tu contexto/sesión
        document_type: 'RUC',
        document_number: '20123456789', // Esto debería venir de tu contexto/sesión
        phone: '987654321',
        email: 'contacto@empresa.com',
        address: {
          address: 'Dirección de la empresa',
          id_region: 1,
          id_district: 1,
          id_sector: 0,
          reference: ''
        }
      },
      // Datos del destinatario
      recipient: {
        full_name: '',
        document_type: '',
        document_number: '',
        phone: '',
        email: '',
        address: {
          address: '',
          id_region: 0,
          id_district: 0,
          id_sector: 0,
          reference: ''
        }
      },
      // Datos del paquete y servicio (simplificados para pickup/warehouse)
      package: {
        description: '',
        weight: 0,
        declared_value: 0,
        special_instructions: ''
      },
      service: {
        origin_type: '',
        type: '',
        delivery_mode: '',
        delivery_date: '',
        payment_method: '',
        payment_form: '',
        notes: ''
      }
    }
  });

  const { formState: { errors }, trigger, handleSubmit } = form;

  // Obtener el modo de entrega actual y calcular pasos dinámicamente
  const watchedValues = form.watch();
  const deliveryMode = watchedValues.service?.delivery_mode;
  const shouldShowPaymentStep = deliveryMode === 'cod';
  const totalSteps = shouldShowPaymentStep ? 3 : 2;
  
  // Calcular isLastStep dinámicamente
  const isLastStep = currentStep === totalSteps;

  // Definición de los pasos (dinámica)
  const getSteps = () => {
    const baseSteps = [
      {
        id: 1,
        title: 'Destinatario',
        description: 'Datos de quien recibe'
      },
      {
        id: 2,
        title: 'Envío',
        description: 'Información del paquete'
      }
    ];

    if (shouldShowPaymentStep) {
      baseSteps.push({
        id: 3,
        title: 'Pago',
        description: 'Método de pago'
      });
    }

    return baseSteps;
  };

  // Efecto para ajustar el stepper cuando cambie el número de pasos
  useEffect(() => {
    // Si el paso actual es mayor al total de pasos disponibles, ir al último paso válido
    if (currentStep > totalSteps) {
      goToStep(totalSteps);
    }
  }, [totalSteps, currentStep, goToStep]);

  // Manejar cambios en las listas de productos
  const handleProductsChange = useCallback((products: typeof productsData) => {
    setProductsData(products);
  }, []);

  // Validar el paso actual antes de avanzar
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 1: // Datos del Destinatario
        const watchedValues = form.watch();
        const selectedDistrict = watchedValues.recipient?.address?.id_district;
        const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

        fieldsToValidate = [
          'recipient.full_name',
          'recipient.document_type',
          'recipient.document_number',
          'recipient.phone',
          'recipient.address.address',
          'recipient.address.id_region',
          'recipient.address.id_district'
        ];

        // Si el distrito tiene sectores, incluir la validación del sector
        if (districtHasSectors) {
          fieldsToValidate.push('recipient.address.id_sector');
        }
        break;
      case 2: // Datos del Envío
        const currentWatchedValues = form.watch();
        const currentOriginType = currentWatchedValues.service?.origin_type;

        // Campos básicos comunes para todos los tipos de envío
        fieldsToValidate = [
          'service.origin_type',
          'service.type',
          'service.delivery_mode',
          'service.delivery_date'
        ];

        // Validaciones específicas según el tipo de envío
        if (currentOriginType === 'pickup') {
          // Para pickup: validar dirección y teléfono del sender
          fieldsToValidate.push(
            'sender.address.address',
            'sender.phone'
          );
        } else if (currentOriginType === 'warehouse') {
          // Para warehouse: no se necesitan campos adicionales del formulario
          // La validación de productos se hace en canProceed()
        }
        // Eliminamos validación de otros tipos ya que solo usamos pickup y warehouse
        break;
      case 3: // Método de Pago (solo existe si hay 3 pasos)
        fieldsToValidate = ['service.payment_method', 'service.payment_form'];
        break;
    }

    const result = await trigger(fieldsToValidate as (keyof ShipmentFormData)[]);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  const handleSubmit_ = async (data: ShipmentFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Datos del envío:', data);
      // Aquí iría la llamada a la API
      // await api.post('/shipments', data);
      alert('Envío registrado correctamente');
    } catch (error) {
      console.error('Error al registrar envío:', error);
      alert('Error al registrar el envío');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar si se puede proceder al siguiente paso
  const canProceed = () => {
    const watchedValues = form.watch();

    switch (currentStep) {
      case 1:
        // Verificar si el distrito seleccionado tiene sectores disponibles
        const selectedDistrict = watchedValues.recipient?.address?.id_district;
        const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

        // Validaciones básicas
        const basicValidation = !errors.recipient?.full_name &&
          !errors.recipient?.document_type &&
          !errors.recipient?.document_number &&
          !errors.recipient?.phone &&
          !errors.recipient?.address?.address &&
          !errors.recipient?.address?.id_region &&
          !errors.recipient?.address?.id_district &&
          // Verificar que los campos obligatorios estén llenos
          watchedValues.recipient?.full_name?.trim() &&
          watchedValues.recipient?.document_type &&
          watchedValues.recipient?.document_number?.trim() &&
          watchedValues.recipient?.phone?.trim() &&
          watchedValues.recipient?.address?.address?.trim() &&
          watchedValues.recipient?.address?.id_region &&
          watchedValues.recipient?.address?.id_district;

        // Si el distrito tiene sectores, validar que se haya seleccionado uno
        if (districtHasSectors) {
          return !!(basicValidation &&
            !errors.recipient?.address?.id_sector &&
            watchedValues.recipient?.address?.id_sector &&
            Number(watchedValues.recipient?.address?.id_sector) > 0);
        }

        return Boolean(basicValidation);
      case 2:
        const originType = watchedValues.service?.origin_type;

        // Validaciones básicas comunes a ambos tipos
        const basicShipmentValidation = !errors.service?.origin_type &&
          !errors.service?.type &&
          !errors.service?.delivery_mode &&
          !errors.service?.delivery_date &&
          watchedValues.service?.origin_type?.trim() &&
          watchedValues.service?.type?.trim() &&
          watchedValues.service?.delivery_mode?.trim() &&
          watchedValues.service?.delivery_date?.trim();

        if (originType === 'pickup') {
          // Para pickup: validar direcciones/teléfonos y que haya productos agregados
          const hasProducts = productsData.pickup.length > 0;
          const hasValidAddress = Boolean(watchedValues.sender?.address?.address?.trim());
          const hasValidPhone = Boolean(watchedValues.sender?.phone?.trim());

          return Boolean(basicShipmentValidation && hasProducts && hasValidAddress && hasValidPhone);
        } else if (originType === 'warehouse') {
          // Para warehouse: validar que haya productos seleccionados del almacén
          const hasWarehouseProducts = productsData.warehouse.length > 0;

          return Boolean(basicShipmentValidation && hasWarehouseProducts);
        } else {
          // Si no hay tipo seleccionado, solo validar campos básicos
          return Boolean(basicShipmentValidation);
        }
      case 3:
        // Este caso solo existe si hay 3 pasos (modo contra entrega)
        return Boolean(!errors.service?.payment_method &&
          !errors.service?.payment_form &&
          // Verificar que los campos obligatorios estén llenos
          watchedValues.service?.payment_method?.trim() &&
          watchedValues.service?.payment_form?.trim());
      default:
        return true;
    }
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <RecipientSection form={form} />;
      case 2:
        return <ShipmentSection form={form} onProductsChange={handleProductsChange} />;
      case 3:
        // Solo renderizar PaymentSection si estamos en modo de 3 pasos (contra entrega)
        return <PaymentSection form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Stepper Header */}
      <Stepper steps={getSteps()} currentStep={currentStep} />

      {/* Form Container */}
      <form onSubmit={handleSubmit(handleSubmit_)} className="space-y-6">
        {/* Current Step Content */}
        <div className="min-h-[600px]">
          {renderCurrentStep()}
        </div>

        {/* Step Navigation */}
        <StepNavigation
          currentStep={currentStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          onPrevious={prevStep}
          onNext={handleNext}
          onSubmit={handleSubmit(handleSubmit_)}
          canProceed={canProceed()}
          totalSteps={totalSteps}
        />
      </form>
    </div>
  );
}
