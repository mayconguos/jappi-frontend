'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, value = '', onChange, error, className, disabled, autoComplete, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const hasValue = Boolean(value && value.trim().length > 0);
    const shouldFloatLabel = isFocused || hasValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={clsx('w-full', className)}>
        {/* Input Container */}
        <div className="relative">
          {/* Input Field */}
          <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          className={clsx(
            'peer w-full h-14 px-4 py-4 pr-12 text-base bg-white border rounded-xl transition-all duration-200 ease-in-out',
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

        {/* Toggle Password Visibility Button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className={clsx(
            'absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors',
            'text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
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

PasswordInput.displayName = 'PasswordInput';
