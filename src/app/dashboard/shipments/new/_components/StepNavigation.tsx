'use client';

import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeliveryLoader from '@/components/ui/delivery-loader';

interface StepNavigationProps {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canProceed?: boolean;
  totalSteps?: number;
}

export default function StepNavigation({
  currentStep,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  onPrevious,
  onNext,
  onSubmit,
  canProceed = true,
  totalSteps = 3
}: StepNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      {/* Botón Anterior */}
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="secondary"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Anterior
          </Button>
        )}
      </div>

      {/* Indicador de paso actual */}
      <div className="text-sm text-gray-500">
        Paso {currentStep} de {totalSteps}
      </div>

      {/* Botón Siguiente/Finalizar */}
      <div>
        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !canProceed}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <DeliveryLoader size="sm" message="" className="!space-y-0" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <Package size={16} />
                <span>Registrar envío</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}