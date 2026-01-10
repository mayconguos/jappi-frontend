'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
  size?: 'default' | 'compact';
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, value = '', onChange, error, className, disabled, size = 'default', icon: Icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = Boolean(value && value.trim().length > 0);
    const isDateInput = props.type === 'date';
    const shouldFloatLabel = isFocused || hasValue || isDateInput;

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
              'peer w-full px-4 bg-gray-50 border rounded-lg transition-all duration-200 ease-in-out',
              Icon && 'pl-10',
              'placeholder-transparent outline-none focus:bg-white',
              // Tamaños
              size === 'compact' ? 'h-10 py-2 text-sm' : 'h-12 py-3 text-base',
              // Estados normales
              !error && !isFocused && 'border-gray-200',
              !error && isFocused && 'border-2 border-[color:var(--button-hover-color)] ring-0',
              // Estados de error
              error && !isFocused && 'border-red-300 bg-red-50/30',
              error && isFocused && 'border-2 border-red-500 bg-red-50/30 ring-0',
              // Estado disabled
              disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
              // Hover
              !disabled && !isFocused && 'hover:border-gray-300'
            )}
            {...props}
          />

          {/* Floating Label */}
          <label
            className={clsx(
              'absolute transition-all duration-200 ease-in-out pointer-events-none select-none',
              !Icon ? 'left-3' : 'left-9',
              // Posición y tamaño cuando flota (arriba) - en la línea del borde
              shouldFloatLabel && '-top-2 text-xs font-medium px-2 bg-white',
              // Posición y tamaño cuando está en el centro
              !shouldFloatLabel && 'top-1/2 -translate-y-1/2',
              !shouldFloatLabel && size === 'compact' ? 'text-sm' : 'text-base',
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

          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon size={18} />
            </div>
          )}
        </div>

        {/* Error Message - Outside the relative container */}
        {
          error && (
            <div className="mt-1 text-red-500 text-sm">
              <span>{error}</span>
            </div>
          )
        }
      </div >
    );
  }
);

Input.displayName = 'Input';
