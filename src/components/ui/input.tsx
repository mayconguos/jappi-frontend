'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'default' | 'compact';
  icon?: LucideIcon;
  prefix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, error, size = 'default', icon: Icon, id, disabled, ...props }, ref) => {
    // Generate a unique ID if one isn't provided for accessibility
    const inputId = React.useId();
    const finalId = id || inputId;

    return (
      <div className={cn('w-full', className)}>
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
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon size={18} />
            </div>
          )}

          {props.prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
              {props.prefix}
            </span>
          )}

          <input
            ref={ref}
            id={finalId}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              // Base styles
              'flex w-full rounded-lg border bg-white px-3 text-sm text-gray-900 shadow-sm transition-all duration-200 ease-in-out',
              'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',

              // Icon padding
              Icon ? 'pl-10' : (props.prefix ? 'pl-12' : 'px-3'),

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

Input.displayName = 'Input';
