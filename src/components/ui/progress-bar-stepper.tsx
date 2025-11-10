'use client';

import React from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProgressBarStepperProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressBarStepper({ steps, currentStep }: ProgressBarStepperProps) {
  return (
    <div className="mb-8">
      {/* Títulos de los pasos */}
      <div className="mb-4">
        <div className="block md:hidden text-center">
          <h3 className="text-base font-semibold text-[var(--surface-dark)]">
            Paso {currentStep}: {steps[currentStep - 1].title}
          </h3>
          <p className="text-sm mt-1 text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
        <div className="hidden md:flex justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex-1 text-center">
              <h3 className={`text-lg font-medium ${currentStep >= step.number ? 'text-[var(--surface-dark)]' : 'text-gray-400'}`}>
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
          className="bg-gradient-to-r from-[var(--surface-light)] to-[var(--surface-dark)] h-3 rounded-full transition-all duration-500 ease-in-out shadow-sm"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}