'use client';

import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'default' | 'compact';
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, className, error, disabled, size = 'default', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Generate a unique ID if one isn't provided for accessibility
    const inputId = React.useId();
    const finalId = id || inputId;

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={cn('w-full', className)}>
        {/* Fixed Label - Stacked */}
        {label && (
          <label
            htmlFor={finalId}
            className="block mb-1.5 text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            id={finalId}
            type={showPassword ? 'text' : 'password'}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              // Base styles
              'flex w-full rounded-lg border bg-white px-3 text-sm text-gray-900 shadow-sm transition-all duration-200 ease-in-out',
              'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',

              // Right padding for the eye icon
              'pr-10',

              // Size variants
              size === 'compact' ? 'h-8 py-1 text-xs' : 'h-10 py-2 text-sm',

              // State: Normal
              !error && !disabled && 'border-gray-300 focus:border-[#02997d] focus:ring-[#02997d]/20',

              // State: Error
              error && !disabled && 'border-red-300 focus:border-red-500 focus:ring-red-200',

              // State: Disabled
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200 hover:border-gray-200',

              className
            )}
            {...props}
          />

          {/* Toggle Password Visibility Button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className={cn(
              'absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-gray-400 transition-colors',
              'hover:text-gray-600 focus:outline-none focus:text-[#02997d]',
              disabled && 'cursor-not-allowed opacity-50 hover:text-gray-400'
            )}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={size === 'compact' ? 16 : 20} />
            ) : (
              <Eye size={size === 'compact' ? 16 : 20} />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-500 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
