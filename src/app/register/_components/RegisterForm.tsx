'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

import { Button } from '@/components/ui/button';
import DeliveryLoader from '@/components/ui/delivery-loader';
import FullScreenDeliveryLoader from '@/components/ui/fullscreen-delivery-loader';
import { ProgressBarStepper } from '@/components/ui/progress-bar-stepper';

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
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-md max-w-4xl w-full">
      {/* <h1 className="text-2xl font-bold text-center text-[var(--surface-dark)] mb-6">
        Registro de Empresa
      </h1> */}

      {/* Progress Bar Stepper */}
      <ProgressBarStepper
        steps={steps}
        currentStep={currentStep}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Paso 1: Datos Personales */}
        {currentStep === 1 && (
          <PersonalDataStep
            form={form}
            watchedValues={watchedValues}
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
            {stepNavigation.isFirstStep ? '← Volver al Login' : '← Anterior'}
          </Button>

          {!stepNavigation.isLastStep ? (
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
              onClick={modals.confirmationModal.open}
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
      <ConfirmationModal
        isOpen={modals.confirmationModal.isOpen}
        onClose={modals.confirmationModal.close}
        onConfirm={handleConfirmSubmit}
        formData={watchedValues}
        paymentMethod={paymentMethod}
        catalog={catalog}
        isSubmitting={registrationSubmit.isSubmittingConfirmation}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        isOpen={modals.successModal.isOpen}
        onClose={modals.successModal.close}
      />

      {/* Modal de Error */}
      <ErrorModal
        isOpen={modals.errorModal.isOpen}
        onClose={modals.errorModal.close}
        title={modals.errorModal.title}
        message={modals.errorModal.message}
      />

      {/* Loader de pantalla completa durante el registro */}
      <FullScreenDeliveryLoader
        isVisible={registrationSubmit.isSubmittingConfirmation}
        message="Registrando tu empresa en Japi Express..."
      />
    </div>
  );
}