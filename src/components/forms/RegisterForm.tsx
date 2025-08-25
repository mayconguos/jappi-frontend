'use client';

import React from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import api from '@/app/services/api';

import { PERSONAL_DOCUMENT_TYPES } from '@/constants/documentTypes';
import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';

// Opciones de apps de pago
const PAYMENT_APPS = [
  { label: 'YAPE', value: 'yape' },
  { label: 'PLIN', value: 'plin' },
  { label: 'Lukita', value: 'lukita' },
  { label: 'Agora Pay', value: 'agora' }
];

import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { getPersonalDocumentValidationInfo } from '@/lib/validations/common';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter, useModal } from '@/components/ui/modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import FullScreenDeliveryLoader from '@/components/ui/fullscreen-delivery-loader';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

// Componentes de pasos
import { PersonalDataStep } from './steps/PersonalDataStep';
import { CompanyDataStep } from './steps/CompanyDataStep';
import { PaymentMethodStep } from './steps/PaymentMethodStep';

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState<'bank' | 'app' | null>(null);
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] = React.useState(false);
  const router = useRouter();

  // Modal de confirmación
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();

  // Modal de éxito
  const { isOpen: isSuccessModalOpen, openModal: openSuccessModal, closeModal: closeSuccessModal } = useModal();

  // Modal de error
  const { isOpen: isErrorModalOpen, openModal: openErrorModal, closeModal: closeErrorModal } = useModal();

  // Estado para el mensaje de error
  const [errorMessage, setErrorMessage] = React.useState('');
  const [errorTitle, setErrorTitle] = React.useState('');

  // Hook para el catálogo de ubicaciones
  const { catalog } = useLocationCatalog();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // Valida en cada cambio
    reValidateMode: 'onChange', // Re-valida en cada cambio
    defaultValues: {
      account_number: '',
      account_type: 1,
      cci_number: '',
      account_holder: '',
      bank: 1
    }
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
    trigger
  } = form;

  const watchedValues = watch();

  // Obtener información de validación para el tipo de documento actual
  const documentValidationInfo = React.useMemo(() => {
    return getPersonalDocumentValidationInfo(watchedValues.document_type || '');
  }, [watchedValues.document_type]);

  // Validación en tiempo real del número de documento
  const documentNumberError = React.useMemo(() => {
    if (!watchedValues.document_type || !watchedValues.document_number) {
      return null;
    }

    const isValid = documentValidationInfo.pattern.test(watchedValues.document_number);

    if (!isValid) {
      // Retornar el mensaje específico según el tipo de documento
      switch (watchedValues.document_type) {
        case '1':
          return 'El DNI debe tener exactamente 8 dígitos numéricos';
        case '4':
          return 'El Carnet de extranjería debe tener máximo 12 caracteres alfanuméricos';
        case '7':
          return 'El Pasaporte debe tener máximo 12 caracteres alfanuméricos';
        case '0':
          return 'El documento debe tener máximo 15 caracteres alfanuméricos';
        case 'A':
          return 'La Cédula Diplomática debe tener máximo 15 caracteres alfanuméricos';
        default:
          return 'Número de documento inválido';
      }
    }
    return null;
  }, [watchedValues.document_type, watchedValues.document_number, documentValidationInfo.pattern]);

  // Validación en tiempo real del número de celular para apps de pago
  const paymentPhoneError = React.useMemo(() => {
    const paymentPhone = watchedValues.payment_phone;
    if (!paymentPhone || paymentMethod !== 'app') {
      return null;
    }

    if (paymentPhone.length > 0 && paymentPhone.length < 9) {
      return 'El número debe tener exactamente 9 dígitos';
    }

    if (paymentPhone.length === 9 && !paymentPhone.startsWith('9')) {
      return 'El número debe empezar con 9';
    }

    return null;
  }, [watchedValues.payment_phone, paymentMethod]);

  // Validación en tiempo real del número de cuenta
  const accountNumberError = React.useMemo(() => {
    const accountNumber = watchedValues.account_number;
    if (!accountNumber) {
      return null;
    }

    if (accountNumber.length < 10) {
      return 'El número de cuenta debe tener al menos 10 dígitos';
    }

    return null;
  }, [watchedValues.account_number]);

  // Validación completa del formulario para habilitar el botón de submit
  const isFormCompleteForSubmit = React.useMemo(() => {
    // Verificar si hay errores en validaciones en tiempo real
    if (documentNumberError || accountNumberError || paymentPhoneError) {
      return false;
    }

    // Paso 1: Datos Personales - campos requeridos
    const step1Complete = !!(
      watchedValues.first_name &&
      watchedValues.last_name &&
      watchedValues.document_type &&
      watchedValues.document_number &&
      watchedValues.email &&
      watchedValues.password
    );

    // Paso 2: Datos de la Empresa - campos requeridos
    const step2Complete = !!(
      watchedValues.company_name &&
      watchedValues.address &&
      watchedValues.region &&
      watchedValues.phone
    );

    // Paso 3: Método de Pago - debe haber seleccionado un método y completado sus datos
    let step3Complete = false;

    if (paymentMethod === 'bank') {
      // Validar datos de cuenta bancaria
      step3Complete = !!(
        watchedValues.account_number &&
        watchedValues.account_holder &&
        watchedValues.bank &&
        watchedValues.account_type
      );
    } else if (paymentMethod === 'app') {
      // Validar datos de app de pagos
      step3Complete = !!(
        watchedValues.payment_app &&
        watchedValues.payment_phone
      );
    }

    return step1Complete && step2Complete && step3Complete;
  }, [
    watchedValues,
    paymentMethod,
    documentNumberError,
    accountNumberError,
    paymentPhoneError
  ]);

  // Función para obtener la ubicación del usuario
  const getCurrentLocation = React.useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude.toString());
          setValue('longitude', position.coords.longitude.toString());
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error);
        }
      );
    }
  }, [setValue]);

  // Obtener ubicación al cargar el componente
  React.useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Validar campos del paso actual
  const validateCurrentStep = async () => {
    let isValid = true;

    switch (currentStep) {
      case 1: // Datos Personales
        isValid = await trigger(['first_name', 'last_name', 'document_type', 'document_number', 'email', 'password']);
        break;
      case 2: // Datos de la Empresa
        isValid = await trigger(['company_name', 'address', 'region', 'phone']);
        break;
      case 3: // Método de Pago
        if (paymentMethod === 'bank') {
          isValid = await trigger(['account_number', 'account_holder', 'bank', 'account_type']);
        } else if (paymentMethod === 'app') {
          isValid = await trigger(['payment_app', 'payment_phone']);
        } else {
          // Si no ha seleccionado método de pago
          return false;
        }
        break;
    }

    return isValid && !documentNumberError && !accountNumberError && !paymentPhoneError;
  };

  // Avanzar al siguiente paso
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Retroceder al paso anterior o ir al login
  const prevStep = () => {
    if (currentStep === 1) {
      router.push('/login');
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Configuración de los pasos
  const steps = [
    { number: 1, title: 'Datos Personales', description: 'Información personal y credenciales' },
    { number: 2, title: 'Datos de la Empresa', description: 'Información de tu empresa' },
    { number: 3, title: 'Método de Pago', description: 'Elige cómo recibir tus pagos' }
  ];

  const onSubmit = async () => {
    // Abrir modal de confirmación en lugar de enviar directamente
    openModal();
  };

  // Función para confirmar y enviar el registro
  const handleConfirmSubmit = async () => {
    try {
      // Cerrar el modal de confirmación inmediatamente al hacer clic
      closeModal();

      // Activar el estado de carga para mostrar el loader de pantalla completa
      setIsSubmittingConfirmation(true);

      const data = watch(); // Obtener todos los datos del formulario
      console.log('Datos del formulario:', data);

      // Transformar los datos al formato requerido por la API
      const transformedData: {
        user: {
          first_name: string;
          last_name: string;
          document_type: string;
          document_number: string;
          email: string;
          password: string;
        };
        company: {
          company_name: string;
          address: string;
          id_region: number;
          id_district: number;
          id_sector?: number;
          phone: string;
          latitude?: string;
          longitude?: string;
          ruc?: string;
          bank_account?: {
            account_number?: string;
            account_type?: number;
            cci_number?: string;
            account_holder?: string;
            bank?: number;
          };
          payment_app?: {
            app_name?: string;
            phone_number?: string;
            account_holder?: string;
            document_number?: string;
          };
        };
      } = {
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          document_type: data.document_type,
          document_number: data.document_number,
          email: data.email,
          password: data.password
        },
        company: {
          company_name: data.company_name,
          address: data.address,
          id_region: data.region,
          id_district: data.district,
          id_sector: data.sector || undefined, // Solo incluir si existe
          phone: data.phone,
          latitude: data.latitude,
          longitude: data.longitude,
          ruc: data.ruc
        }
      };

      // Agregar bank_account dentro de company si es método bancario
      if (paymentMethod === 'bank') {
        transformedData.company.bank_account = {
          account_number: data.account_number,
          account_type: data.account_type,
          cci_number: data.cci_number,
          account_holder: data.account_holder,
          bank: data.bank
        };
      }

      // Agregar payment_app dentro de company si es método de app
      if (paymentMethod === 'app') {
        transformedData.company.payment_app = {
          app_name: data.payment_app,
          phone_number: data.payment_phone,
          account_holder: data.payment_account_holder,
          document_number: data.payment_document_number
        };
      }

      console.log('Datos transformados para la API:', transformedData);

      // Llamada a la API para enviar los datos al servidor
      const response = await api.post('/user/company', transformedData);

      if (response.data) {
        // Desactivar el estado de carga
        setIsSubmittingConfirmation(false);

        // Mostrar modal de éxito
        openSuccessModal();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error: unknown) {
      console.error('Error al registrar:', error);
      // Desactivar el estado de carga en caso de error
      setIsSubmittingConfirmation(false);

      // Manejo de errores específicos
      let errorMsg = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
      let errorTitleMsg = 'Error en el Registro';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: { message?: string } } };
        if (axiosError.response) {
          switch (axiosError.response.status) {
            case 400:
              errorTitleMsg = 'Datos Inválidos';
              errorMsg = axiosError.response.data?.message || 'Los datos ingresados no son válidos. Por favor, verifica la información y vuelve a intentarlo.';
              break;
            case 409:
              errorTitleMsg = 'Registro Duplicado';
              errorMsg = 'Ya existe una empresa registrada con este email. Por favor, verifica los datos o utiliza información diferente.';
              break;
            case 422:
              errorTitleMsg = 'Datos Incompletos';
              errorMsg = 'Algunos datos están incompletos o son inválidos. Por favor, revisa todos los campos del formulario.';
              break;
            case 500:
              errorTitleMsg = 'Error del Servidor';
              errorMsg = 'Ocurrió un error interno en nuestros servidores. Por favor, intenta nuevamente en unos momentos.';
              break;
            default:
              errorTitleMsg = 'Error del Servidor';
              errorMsg = `Error del servidor (código ${axiosError.response.status}). Si el problema persiste, contacta al soporte técnico.`;
          }
        } else {
          errorTitleMsg = 'Sin Conexión';
          errorMsg = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.';
        }
      }

      // Configurar y mostrar modal de error
      setErrorTitle(errorTitleMsg);
      setErrorMessage(errorMsg);
      openErrorModal();
    }
  };

  // Funciones para obtener datos formateados del resumen
  const getFormattedData = () => {
    const data = watch();

    // Obtener el nombre de la región desde el catálogo
    const region = catalog?.find(r => r.id_region === data.region);

    // Obtener el nombre del distrito desde el catálogo
    let district = null;
    if (data.district && region) {
      district = region.districts.find(d => d.id_district === data.district);
    }

    // Obtener el nombre del sector desde el catálogo
    let sector = null;
    if (data.sector && district) {
      sector = district.sectors.find(s => s.id_sector === data.sector);
    }

    // Obtener el nombre del banco (si es cuenta bancaria)
    const banco = BANCOS.find(b => b.value === data.bank);

    // Obtener el tipo de cuenta (si es cuenta bancaria)
    const tipoCuenta = TIPOS_CUENTA.find(t => t.value === data.account_type);

    // Obtener el tipo de documento
    const tipoDocumento = PERSONAL_DOCUMENT_TYPES.find(d => d.value === data.document_type);

    // Obtener la app de pago (si es app)
    const appPago = PAYMENT_APPS.find(a => a.value === data.payment_app);

    return {
      ...data,
      region_label: region?.region_name,
      district_label: district?.district_name,
      sector_label: sector?.sector_name,
      banco_label: banco?.label,
      tipo_cuenta_label: tipoCuenta?.label,
      tipo_documento_label: tipoDocumento?.label,
      app_pago_label: appPago?.label
    };
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-md max-w-4xl w-full">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Registro de Empresa
      </h1>

      {/* Progress Bar Stepper */}
      <div className="mb-8">
        {/* Títulos de los pasos */}
        <div className="mb-4">
          <div className="block md:hidden text-center">
            <h3 className="text-base font-semibold text-blue-600">
              Paso {currentStep}: {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm mt-1 text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="hidden md:flex justify-between">
            {steps.map((step) => (
              <div key={step.number} className="flex-1 text-center">
                <h3 className={`text-lg font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>
                  Paso {step.number}: {step.title}
                </h3>
                <p className={`text-sm mt-1 ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out shadow-sm"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Paso 1: Datos Personales */}
        {currentStep === 1 && (
          <PersonalDataStep
            form={form}
            watchedValues={watchedValues}
            documentNumberError={documentNumberError || ''}
          />
        )}

        {/* Paso 2: Datos de la Empresa */}
        {currentStep === 2 && (
          <CompanyDataStep
            form={form}
            watchedValues={watchedValues}
          />
        )}

        {/* Paso 3: Método de Pago */}
        {currentStep === 3 && (
          <PaymentMethodStep
            form={form}
            watchedValues={watchedValues}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            accountNumberError={accountNumberError}
            paymentPhoneError={paymentPhoneError}
          />
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="flex items-center gap-2"
          >
            {currentStep === 1 ? '← Volver al Login' : '← Anterior'}
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Siguiente →
            </Button>
          ) : (
            <Button
              type="button"
              onClick={openModal}
              disabled={isSubmitting || !isFormCompleteForSubmit}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <DeliveryLoader size="sm" message="" className="!space-y-0" />
                  <span>Registrando...</span>
                </>
              ) : (
                'Registrar Empresa'
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Modal de confirmación */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Confirmar Registro"
        description="Revisa los datos antes de completar el registro"
        size="md"
      >
        <div className="space-y-4">
          {/* Resumen compacto de todos los datos */}
          <div className="space-y-3 text-xs">
            {/* Datos Personales */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                � Datos Personales
              </h4>
              <div className="space-y-1">
                <p className="text-gray-700">
                  <span className="font-medium">Nombre:</span> {getFormattedData().first_name} {getFormattedData().last_name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Documento:</span> {getFormattedData().tipo_documento_label} {getFormattedData().document_number}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {getFormattedData().email}
                </p>
              </div>
            </div>

            {/* Datos de la Empresa */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                🏢 Empresa
              </h4>
              <div className="space-y-1">
                <p className="text-gray-700">
                  <span className="font-medium">Empresa:</span> {getFormattedData().company_name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Dirección:</span> {getFormattedData().address}, {getFormattedData().district_label}{getFormattedData().sector_label ? `, ${getFormattedData().sector_label}` : ''}, {getFormattedData().region_label}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Teléfono:</span> {getFormattedData().phone}
                </p>
                {getFormattedData().ruc && (
                  <p className="text-gray-700">
                    <span className="font-medium">RUC:</span> {getFormattedData().ruc}
                  </p>
                )}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                💳 Método de Pago
              </h4>
              <div className="space-y-1">
                {paymentMethod === 'bank' ? (
                  <>
                    <p className="text-gray-700">
                      <span className="font-medium">Tipo:</span> Cuenta Bancaria
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Banco:</span> {getFormattedData().banco_label}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Cuenta:</span> {getFormattedData().tipo_cuenta_label} - {getFormattedData().account_number}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Titular:</span> {getFormattedData().account_holder}
                    </p>
                    {getFormattedData().cci_number && (
                      <p className="text-gray-700">
                        <span className="font-medium">CCI:</span> {getFormattedData().cci_number}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-gray-700">
                      <span className="font-medium">Tipo:</span> App de Pagos
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">App:</span> {getFormattedData().app_pago_label}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Celular:</span> {getFormattedData().payment_phone}
                    </p>
                    {getFormattedData().payment_account_holder && (
                      <p className="text-gray-700">
                        <span className="font-medium">Titular:</span> {getFormattedData().payment_account_holder}
                      </p>
                    )}
                    {getFormattedData().payment_document_number && (
                      <p className="text-gray-700">
                        <span className="font-medium">Documento:</span> {getFormattedData().payment_document_number}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <ModalFooter className="py-3">
          <Button
            variant="outline"
            onClick={closeModal}
            size="sm"
          >
            Editar
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            disabled={isSubmittingConfirmation}
            className="flex items-center gap-2"
            size="sm"
          >
            {isSubmittingConfirmation ? (
              <>
                <DeliveryLoader size="sm" message="" className="!space-y-0" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>Confirmar</span>
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        showCloseButton={false}
        closeOnOverlayClick={false}
        title="¡Registro Exitoso!"
        description="Tu solicitud ha sido recibida correctamente"
        size="md"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">¡Bienvenido(a) a Jappi Express! 🎉</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Estamos verificando tus datos para activar tu cuenta. Te notificaremos por correo electrónico cuando el proceso esté completo.
          </p>
        </div>
        <ModalFooter className="py-3 flex justify-center space-x-2">
          <Button
            onClick={() => {
              closeSuccessModal();
              router.push('/login');
            }}
          >
            Entendido
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de Error */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title={errorTitle}
        description="Se encontró un problema durante el registro"
        size="sm"
      >
        <div className="py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-xs">
              💡 <strong>Consejo:</strong> Revisa los datos ingresados y vuelve a intentarlo. Si el problema persiste, contacta al soporte.
            </p>
          </div>
        </div>
        <ModalFooter className="py-3">
          <Button
            variant="outline"
            onClick={closeErrorModal}
            size="sm"
            className="flex-1"
          >
            Entendido
          </Button>
        </ModalFooter>
      </Modal>

      {/* Loader de pantalla completa durante el registro */}
      <FullScreenDeliveryLoader
        isVisible={isSubmittingConfirmation}
        message="Registrando tu empresa en Jappi Express..."
      />
    </div>
  );
}