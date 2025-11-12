'use client';

import { useState, useCallback } from 'react';

interface UseStepperProps {
  totalSteps: number;
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

interface StepperReturn {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setStep: (step: number) => void;
  reset: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Hook reutilizable para manejar la navegación por pasos en wizards/steppers
 * 
 * @param totalSteps - Número total de pasos
 * @param initialStep - Paso inicial (por defecto 1)
 * @param onStepChange - Callback que se ejecuta cuando cambia el paso
 * @returns Objeto con estado y métodos para controlar el stepper
 */
export const useStepper = ({
  totalSteps,
  initialStep = 1,
  onStepChange
}: UseStepperProps): StepperReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, totalSteps, onStepChange]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps && step !== currentStep) {
      setCurrentStep(step);
      onStepChange?.(step);
    }
  }, [currentStep, totalSteps, onStepChange]);

  const setStep = useCallback((step: number) => {
    goToStep(step);
  }, [goToStep]);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    onStepChange?.(initialStep);
  }, [initialStep, onStepChange]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const progress = (currentStep / totalSteps) * 100;
  const canGoNext = currentStep < totalSteps;
  const canGoPrev = currentStep > 1;

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    setStep,
    reset,
    isFirstStep,
    isLastStep,
    progress,
    canGoNext,
    canGoPrev
  };
};