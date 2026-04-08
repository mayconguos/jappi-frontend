'use client';

interface StepIndicatorProps {
  currentStep: number; // 1-4
}

const STEPS = [
  { number: 1, label: 'Plantilla' },
  { number: 2, label: 'Upload' },
  { number: 3, label: 'Validación' },
  { number: 4, label: 'Confirmar' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 select-none">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-500 border-2
                  ${isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 scale-110'
                      : 'bg-white border-gray-200 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-[11px] font-medium transition-colors duration-300 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={`
                  w-16 h-0.5 mx-1 mb-5 transition-all duration-500
                  ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
