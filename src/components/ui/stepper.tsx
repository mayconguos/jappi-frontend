'use client';

import { Check } from 'lucide-react';

export interface Step {
  id: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  variant?: 'default' | 'compact';
  className?: string;
  showStepInfo?: boolean;
  inactiveColor?: string;
}

export default function Stepper({
  steps,
  currentStep,
  variant = 'default',
  className = '',
  showStepInfo = true,
  inactiveColor = 'gray'
}: StepperProps) {
  const getStepStyles = (step: Step) => {
    if (currentStep > step.id) {
      return {
        circle: 'text-white',
        circleStyle: { backgroundColor: 'var(--surface-dark)', borderColor: 'var(--surface-dark)' },
        title: 'text-gray-900',
        description: 'text-gray-600',
        connector: 'bg-gray-300',
        connectorStyle: { backgroundColor: 'var(--surface-dark)' }
      };
    } else if (currentStep === step.id) {
      return {
        circle: 'text-white',
        circleStyle: { backgroundColor: 'var(--button-hover-color)', borderColor: 'var(--button-hover-color)' },
        title: 'text-gray-900',
        description: 'text-gray-600',
        connector: 'bg-gray-300',
        connectorStyle: {}
      };
    } else {
      // Inactive
      return {
        circle: `bg-${inactiveColor}-100 border-${inactiveColor}-300 text-${inactiveColor}-500`,
        circleStyle: {},
        title: `text-${inactiveColor}-500`,
        description: `text-${inactiveColor}-400`,
        connector: 'bg-gray-300',
        connectorStyle: {}
      };
    }
  };

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const styles = getStepStyles(step);

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${styles.circle}
                  `}
                  style={styles.circleStyle}
                >
                  {currentStep > step.id ? (
                    <Check size={16} />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Step Info - Desktop */}
                {showStepInfo && variant === 'default' && (
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium transition-colors duration-300 ${styles.title}`}>
                      {step.title}
                    </p>
                    {step.description && (
                      <p className={`text-xs transition-colors duration-300 ${styles.description}`}>
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors duration-300
                    ${styles.connector}
                  `}
                  style={styles.connectorStyle}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Info */}
      {showStepInfo && variant === 'default' && (
        <div className="sm:hidden mt-4 text-center">
          <p className="text-sm font-medium text-gray-900">
            {currentStepData?.title}
          </p>
          {currentStepData?.description && (
            <p className="text-xs text-gray-600">
              {currentStepData.description}
            </p>
          )}
        </div>
      )}

      {/* Compact variant - Step counter */}
      {variant === 'compact' && (
        <div className="text-center mt-2">
          <span className="text-sm text-gray-500">
            Paso {currentStep} de {steps.length}
          </span>
        </div>
      )}
    </div>
  );
}