'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

import { Button } from '@/components/ui/button';
import DeliveryLoader from '@/components/ui/delivery-loader';
import FullScreenDeliveryLoader from '@/components/ui/fullscreen-delivery-loader';

// Hooks personalizados
import { useStepValidation } from '../_hooks/useStepValidation';
import { useRegistrationModals } from '../_hooks/useRegistrationModals';
import { useRegistrationSubmit } from '../_hooks/useRegistrationSubmit';

// Constantes
import { REGISTRATION_STEPS, REGISTRATION_FORM_DEFAULT_VALUES } from '../_constants/registrationConfig';

// Componentes
import { CompanyDataStep } from '../_steps/CompanyDataStep';
import { PaymentMethodStep } from '../_steps/PaymentMethodStep';
import { PersonalDataStep } from '../_steps/PersonalDataStep';

import { ConfirmationModal } from '../_modals/ConfirmationModal';
import { ErrorModal } from '../_modals/ErrorModal';
import { SuccessModal } from '../_modals/SuccessModal';

export default function RegisterForm() {
  const [paymentMethod, setPaymentMethod] = React.useState<'bank' | 'app' | null>(null);

  // Hook para el catálogo de ubicaciones
  const { catalog } = useLocationCatalog();

  // Hooks personalizados
  const modals = useRegistrationModals();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: REGISTRATION_FORM_DEFAULT_VALUES
  });

  const { handleSubmit, formState: { isSubmitting }, watch } = form;
  const watchedValues = watch();

  const steps = REGISTRATION_STEPS;

  // Simplificamos: solo una instancia de validación
  const [currentStep, setCurrentStep] = React.useState(1);

  // Hook de validación único
  const validation = useStepValidation(
    form,
    watchedValues,
    paymentMethod,
    currentStep
  );

  // Hook de navegación simplificado sin conflictos
  const stepNavigation = {
    currentStep,
    nextStep: async () => {
      const isValid = await validation.validateCurrentStep();
      if (isValid && currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    },
    prevStep: () => {
      if (currentStep === 1) {
        window.location.href = '/login';
      } else if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    },
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === steps.length
  };

  const { isFormCompleteForSubmit } = validation;

  const registrationSubmit = useRegistrationSubmit({
    paymentMethod,
    form,
    onSuccess: () => {
      modals.successModal.open();
    },
    onError: (title, message) => {
      modals.errorModal.showError(title, message);
    }
  });

  const { nextStep, prevStep } = stepNavigation;

  const onSubmit = async () => {
    modals.confirmationModal.open();
  };

  // Función simplificada usando el hook de envío
  const handleConfirmSubmit = async () => {
    modals.confirmationModal.close();
    await registrationSubmit.handleConfirmSubmit();
  };

  return (
    <div className="w-full max-w-[600px] mx-auto px-4 sm:px-8 py-8 md:py-12">
      {/* Header Mobile (Logo visible solo en mobile) */}
      <div className="lg:hidden flex flex-col items-center mb-8">
        <div className="flex items-center gap-2">
          {/* Logo placeholder if needed, or keeping it plain text as per login request */}
          <span className="text-xl font-bold text-gray-900">Japi Express</span>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Registra tu empresa
        </h1>
        <p className="text-base text-gray-500 mb-6">
          Completa los pasos para activar tu cuenta corporativa.
        </p>

        {/* Visual Stepper */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${step <= currentStep ? 'bg-[#02997d]' : 'bg-gray-200'
                }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Paso 1: Datos Personales */}
        <div className={currentStep === 1 ? 'block' : 'hidden'}>
          <PersonalDataStep
            form={form}
            watchedValues={watchedValues}
          />
        </div>

        {/* Paso 2: Datos de la Empresa */}
        <div className={currentStep === 2 ? 'block' : 'hidden'}>
          <CompanyDataStep
            form={form}
            watchedValues={watchedValues}
          />
        </div>

        {/* Paso 3: Método de Pago */}
        <div className={currentStep === 3 ? 'block' : 'hidden'}>
          <PaymentMethodStep
            form={form}
            watchedValues={watchedValues}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
          {currentStep === 1 ? (
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Cancelar registro
            </a>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              className="text-gray-600"
            >
              Atrás
            </Button>
          )}

          {!stepNavigation.isLastStep ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={nextStep}
              className="px-8 shadow-lg shadow-[#02997d]/20"
            >
              Siguiente <span className="ml-2">→</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={modals.confirmationModal.open}
              disabled={isSubmitting || !isFormCompleteForSubmit || !paymentMethod}
              className="px-8 shadow-lg shadow-[#02997d]/20"
            >
              {isSubmitting ? 'Registrando...' : 'Finalizar Registro'}
            </Button>
          )}
        </div>
      </form>

      {/* Footer del Registro */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-semibold text-[#02997d] hover:underline">
            Inicia sesión aquí
          </a>
        </p>
      </div>

      {/* Modales (Confirmación, Éxito, Error) - Se mantienen igual */}
      <ConfirmationModal
        isOpen={modals.confirmationModal.isOpen}
        onClose={modals.confirmationModal.close}
        onConfirm={handleConfirmSubmit}
        formData={watchedValues}
        paymentMethod={paymentMethod}
        catalog={catalog}
        isSubmitting={registrationSubmit.isSubmittingConfirmation}
      />
      <SuccessModal
        isOpen={modals.successModal.isOpen}
        onClose={modals.successModal.close}
      />
      <ErrorModal
        isOpen={modals.errorModal.isOpen}
        onClose={modals.errorModal.close}
        title={modals.errorModal.title}
        message={modals.errorModal.message}
      />
      <FullScreenDeliveryLoader
        isVisible={registrationSubmit.isSubmittingConfirmation}
        message="Registrando tu empresa en Japi Express..."
      />
    </div>
  );
}