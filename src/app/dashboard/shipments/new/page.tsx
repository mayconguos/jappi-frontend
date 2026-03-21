'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { shipmentSchema, type ShipmentFormData } from '@/lib/validations/shipment';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';
import { useAuth } from '@/context/AuthContext';
import api from '@/app/services/api';

import { Button } from '@/components/ui/button';

import ShipmentSection from './_components/ShipmentSection';
import RecipientSection from './_components/RecipientSection';
import PaymentSection from './_components/PaymentSection';
import ShipmentSummary from './_components/ShipmentSummary';
import StatusModal, { StatusType } from '@/components/ui/status-modal';
import { useModal } from '@/components/ui/modal';

export default function CreateShipmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productsData, setProductsData] = useState<{
    pickup: Array<{ description: string; quantity: number; id: string }>;
    warehouse: Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>;
  }>({
    pickup: [],
    warehouse: []
  });

  // Estado para el modal de estado
  const { isOpen: isStatusOpen, openModal: openStatus, closeModal: closeStatus } = useModal();
  const [statusConfig, setStatusConfig] = useState<{
    type: StatusType;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({
    type: 'info',
    title: '',
    message: ''
  });

  const showStatus = (config: typeof statusConfig) => {
    setStatusConfig(config);
    openStatus();
  };

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
        phone: '987654321',
        address: {
          id_address: 0,
          address: 'Dirección de Recojo',
          id_region: 0,
          id_district: 0,
          id_sector: 0,
          reference: ''
        }
      },
      recipient: {
        full_name: '',
        phone: '',
        address: {
          address: '',
          id_region: 0,
          id_district: 0,
          id_sector: 0,
          reference: ''
        }
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
      'service.type'
    ];

    if (currentOriginType === 'pickup') {
      fieldsToValidate.push('sender.address.address', 'sender.phone');
    }

    const isValidForm = await trigger(fieldsToValidate as (keyof ShipmentFormData)[]);

    // Validar lógicas de negocio adicionales (productos)
    let hasProducts = true;
    if (currentOriginType === 'pickup') {
      hasProducts = productsData.pickup.length > 0;
    } else if (currentOriginType === 'stock') {
      hasProducts = productsData.warehouse.length > 0;
    }

    if (!hasProducts) {
      showStatus({
        type: 'warning',
        title: 'Productos requeridos',
        message: 'Debes agregar al menos un producto para continuar con el registro del envío.'
      });
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
      'recipient.address.id_district',
      'service.delivery_mode',
      'service.delivery_date'
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
        showStatus({
          type: 'error',
          title: 'Secciones incompletas',
          message: 'Por favor, completa todas las secciones antes de intentar registrar el envío.'
        });
        return;
      }

      // Validación de contexto de usuario
      const idCompany = user?.id_company || user?.id;
      if (!idCompany) {
        showStatus({
          type: 'error',
          title: 'Error de sesión',
          message: 'No se pudo identificar a la empresa asociada. Por favor, vuelve a iniciar sesión.',
          actionLabel: 'Ir al Login',
          onAction: () => router.push('/login')
        });
        return;
      }

      // Construcción del request body estructurado según backend
      const rawProducts = data.service.origin_type === 'pickup' ? productsData.pickup : productsData.warehouse;
      const parsedProducts = rawProducts.map(p => ({
        product_name: p.description,
        quantity: p.quantity,
        ...(p.id && data.service.origin_type === 'stock' ? { id: p.id } : {})
      }));

      const isCod = data.service.delivery_mode === 'pay_on_delivery';

      const requestBody = {
        id_company: idCompany,
        origin_type: data.service.origin_type, // pickup / stock
        service_type: data.service.type, // regular / express
        shipping_mode: data.service.delivery_mode, // delivery_only / pay_on_delivery
        date: data.service.delivery_date,

        ...(isCod ? {
          delivery_include: data.service.cod_includes_delivery,
          total_amount: data.service.cod_amount,
          payment_method: data.service.payment_method,
          payment_destination: data.service.payment_form,
        } : {}),

        delivery: {
          customer_name: data.recipient.full_name,
          address: {
            address: data.recipient.address.address,
            id_region: data.recipient.address.id_region,
            id_district: data.recipient.address.id_district,
            id_sector: data.recipient.address.id_sector || 0
          },
          phone: data.recipient.phone
        },

        ...(data.service.origin_type === 'pickup' ? {
          pickup: {
            id_address: data.sender.address.id_address || 0,
            phone: data.sender.phone
          }
        } : {}),

        products: parsedProducts
      };

      // Llamada real a la API
      await api.post('/shipping', requestBody);

      // Resetear la vista para prevenir envíos duplicados (UX Best Practice)
      form.reset();
      setIsShipmentComplete(false);
      setIsRecipientComplete(false);
      setProductsData({ pickup: [], warehouse: [] });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      showStatus({
        type: 'success',
        title: '¡Envío Exitoso!',
        message: 'Tu envío ha sido registrado correctamente en el sistema.',
        actionLabel: 'Ver mis envíos',
        onAction: () => router.push('/dashboard/shipments/list')
      });

    } catch (error: any) {
      console.error('Error al registrar envío:', error);
      const errorMessage = error.response?.data?.message || 'Ocurrió un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.';
      
      showStatus({
        type: 'error',
        title: 'Error de registro',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 pt-8">

      {/* Page Header */}
      {/* Page Header Removed as requested */}


      <form id="shipment-form" onSubmit={hookFormHandleSubmit(onSubmit, (errors) => console.log('ERRORES DE VALIDACIÓN:', errors))} className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

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

      {/* Modal de Estado Global */}
      <StatusModal
        isOpen={isStatusOpen}
        onClose={closeStatus}
        {...statusConfig}
      />
    </div>
  );
}
