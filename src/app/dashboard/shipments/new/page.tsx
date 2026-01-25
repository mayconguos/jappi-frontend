'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { shipmentSchema, type ShipmentFormData } from '@/lib/validations/shipment';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

import { Button } from '@/components/ui/button';

import ShipmentSection from './_components/ShipmentSection';
import RecipientSection from './_components/RecipientSection';
import PaymentSection from './_components/PaymentSection';
import ShipmentSummary from './_components/ShipmentSummary';

export default function CreateShipmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productsData, setProductsData] = useState<{
    pickup: Array<{ description: string; quantity: number; id: string }>;
    warehouse: Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>;
  }>({
    pickup: [],
    warehouse: []
  });

  // Estados para el flujo en cascada
  const [isShipmentComplete, setIsShipmentComplete] = useState(false);
  const [isRecipientComplete, setIsRecipientComplete] = useState(false);

  // Referencias para scroll automático
  const recipientRef = useRef<HTMLElement>(null);
  const paymentRef = useRef<HTMLElement>(null);

  // Hook para validación de ubicaciones
  const { getSectorOptions } = useLocationCatalog();

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    mode: 'onChange',
    defaultValues: {
      sender: {
        full_name: 'EMPRESA REMITENTE',
        document_type: 'RUC',
        document_number: '20123456789',
        phone: '987654321',
        email: 'contacto@empresa.com',
        address: {
          address: 'Dirección de Recojo',
          id_region: 1,
          id_district: 1,
          id_sector: 0,
          reference: ''
        }
      },
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

  const { trigger, handleSubmit: hookFormHandleSubmit, watch } = form;

  // Obtener el modo de entrega actual
  const watchedValues = watch();
  const deliveryMode = watchedValues.service?.delivery_mode;
  const shouldShowPaymentStep = deliveryMode === 'pay_on_delivery';

  // Manejar cambios en las listas de productos
  const handleProductsChange = useCallback((products: typeof productsData) => {
    setProductsData(products);
  }, []);

  // Función para scroll suave
  const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Validar Sección: Envío
  const validateShipmentSection = async (): Promise<boolean> => {
    const currentOriginType = watchedValues.service?.origin_type;

    // Campos básicos
    const fieldsToValidate = [
      'service.origin_type',
      'service.type',
      'service.delivery_mode',
      'service.delivery_date'
    ];

    if (currentOriginType === 'pickup') {
      fieldsToValidate.push('sender.address.address', 'sender.phone');
    }

    const isValidForm = await trigger(fieldsToValidate as (keyof ShipmentFormData)[]);

    // Validar lógicas de negocio adicionales (productos)
    let hasProducts = true;
    if (currentOriginType === 'pickup') {
      hasProducts = productsData.pickup.length > 0;
    } else if (currentOriginType === 'warehouse') {
      hasProducts = productsData.warehouse.length > 0;
    }

    if (!hasProducts) {
      alert('Debes agregar al menos un producto para continuar.');
      return false;
    }

    return isValidForm && hasProducts;
  };

  // Validar Sección: Destinatario
  const validateRecipientSection = async (): Promise<boolean> => {
    const selectedDistrict = watchedValues.recipient?.address?.id_district;
    const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

    const fieldsToValidate = [
      'recipient.full_name',
      'recipient.phone',
      'recipient.address.address',
      'recipient.address.id_region',
      'recipient.address.id_district'
    ];

    if (districtHasSectors) {
      fieldsToValidate.push('recipient.address.id_sector');
    }

    return await trigger(fieldsToValidate as (keyof ShipmentFormData)[]);
  };

  // Calcular si el formulario está listo para envio
  // 1. Shipment y Recipient completos
  // 2. Si es Contra Entrega (shouldShowPaymentStep), validar método y forma de pago
  const isPaymentValid = !shouldShowPaymentStep || (watchedValues.service?.payment_method && watchedValues.service?.payment_form);
  const isFormReady = isShipmentComplete && isRecipientComplete && isPaymentValid;

  // Handlers
  const handleContinueShipment = async () => {
    const isValid = await validateShipmentSection();
    if (isValid) {
      setIsShipmentComplete(true);
      scrollToRef(recipientRef);
    }
  };

  const handleEditShipment = () => {
    setIsShipmentComplete(false);
  };

  const handleContinueRecipient = async () => {
    const isValid = await validateRecipientSection();
    if (isValid) {
      setIsRecipientComplete(true);
      if (shouldShowPaymentStep) {
        scrollToRef(paymentRef);
      }
    }
  };

  const handleEditRecipient = () => {
    setIsRecipientComplete(false);
  };

  // Submit Final
  const onSubmit = async (data: ShipmentFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Datos del envío:', data);

      // Validación final de seguridad
      if (!isShipmentComplete || !isRecipientComplete) {
        alert('Por favor completa todas las secciones antes de continuar.');
        return;
      }

      // TODO: Llamada real a la API
      // const productsToSend = data.service.origin_type === 'pickup' ? productsData.pickup : productsData.warehouse;
      // await api.post('/shipments', { ...data, products: productsToSend });

      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('¡Envío registrado exitosamente!');
      router.push('/dashboard/shipments/list');

    } catch (error) {
      console.error('Error al registrar envío:', error);
      alert('Error al registrar el envío');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 pt-8">

      {/* Page Header */}
      {/* Page Header Removed as requested */}


      <form id="shipment-form" onSubmit={hookFormHandleSubmit(onSubmit)} className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

        {/* COLUMNA IZQUIERDA: Formularios (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECCIÓN 1: ENVÍO */}
          <section>
            <ShipmentSection
              form={form}
              onProductsChange={handleProductsChange}
              isActive={!isShipmentComplete}
              isCompleted={isShipmentComplete}
              onContinue={handleContinueShipment}
              onEdit={handleEditShipment}
            />
          </section>

          {/* SECCIÓN 2: DESTINATARIO */}
          {(isShipmentComplete || isRecipientComplete) && (
            <section ref={recipientRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <RecipientSection
                form={form}
                isActive={isShipmentComplete && !isRecipientComplete}
                isCompleted={isRecipientComplete}
                onContinue={handleContinueRecipient}
                onEdit={handleEditRecipient}
              />

              {/* Botón de Registro SI NO hay paso de pago */}
              {isRecipientComplete && !shouldShowPaymentStep && (
                <div className="pt-8 flex justify-end animate-in fade-in zoom-in duration-500 lg:hidden">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isFormReady}
                    variant="primary"
                    size="lg"
                    className="h-14 px-10 rounded-2xl shadow-xl shadow-teal-900/10 hover:shadow-2xl hover:scale-105 transition-all text-lg font-bold w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span> Registrando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span> Registrar Envío
                      </>
                    )}
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* SECCIÓN 3: PAGO (Condicional) */}
          {shouldShowPaymentStep && isRecipientComplete && (
            <section ref={paymentRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <PaymentSection
                form={form}
                isActive={isRecipientComplete}
                isCompleted={false}
                onSubmit={hookFormHandleSubmit(onSubmit)}
                isLoading={isSubmitting}
              />
            </section>
          )}
        </div>

        {/* COLUMNA DERECHA: Resumen (Span 4) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-6">
          <ShipmentSummary watchedValues={watchedValues} isSubmitting={isSubmitting} disabled={!isFormReady} />
        </div>

      </form>
    </div>
  );
}
