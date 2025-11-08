'use client';

import * as React from 'react';
import { clsx } from 'clsx';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, value = '', onChange, error, className, disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = Boolean(value && value.trim().length > 0);
    const shouldFloatLabel = isFocused || hasValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className={clsx('w-full', className)}>
        {/* Input Container */}
        <div className="relative">
          {/* Input Field */}
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={clsx(
              'peer w-full h-14 px-4 py-4 text-base bg-white border rounded-xl transition-all duration-200 ease-in-out',
              'placeholder-transparent outline-none',
              // Estados normales
              !error && !isFocused && 'border-gray-300',
              !error && isFocused && 'border-2 border-[color:var(--button-hover-color)] ring-0',
              // Estados de error
              error && !isFocused && 'border-red-300 bg-red-50/30',
              error && isFocused && 'border-2 border-red-500 bg-red-50/30 ring-0',
              // Estado disabled
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              // Hover
              !disabled && !isFocused && 'hover:border-gray-400'
            )}
            {...props}
          />

          {/* Floating Label */}
          <label
            className={clsx(
              'absolute left-3 transition-all duration-200 ease-in-out pointer-events-none select-none',
              // Posición y tamaño cuando flota (arriba) - en la línea del borde
              shouldFloatLabel && '-top-2 text-xs font-medium px-2 bg-white',
              // Posición y tamaño cuando está en el centro
              !shouldFloatLabel && 'top-1/2 -translate-y-1/2 text-base',
              // Colores según el estado
              !error && !isFocused && shouldFloatLabel && 'text-gray-600',
              !error && !isFocused && !shouldFloatLabel && 'text-gray-500',
              !error && isFocused && 'text-[color:var(--button-hover-color)]',
              error && shouldFloatLabel && 'text-red-500',
              error && !shouldFloatLabel && 'text-gray-500',
              disabled && 'text-gray-400'
            )}
          >
            {label}
          </label>
        </div>

        {/* Error Message - Outside the relative container */}
        {error && (
          <div className="mt-1 text-red-500 text-sm">
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
