'use client';

import * as React from 'react';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown, LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  size?: 'default' | 'compact';
  placeholder?: string;
  icon?: LucideIcon;
}

export const Select = ({ value, onChange, options, label, error, className, disabled, size = 'default', placeholder, icon: Icon }: SelectProps) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const selectedOption = options.find((o) => o.value === value);
  const hasValue = Boolean(value && value !== '');
  const shouldFloatLabel = isFocused || hasValue;

  return (
    <div className={clsx('w-full', className)}>
      {/* Select Container */}
      <div className="relative">
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          <Listbox.Button
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={clsx(
              'w-full px-4 pr-10 bg-gray-50 border rounded-lg transition-all duration-200 ease-in-out text-left',
              'focus:outline-none focus:bg-white',
              // Tamaños
              size === 'compact' ? 'h-10 py-2 text-sm' : 'h-12 py-3 text-base',
              // Estados normales
              !error && !isFocused && 'border-gray-200',
              !error && isFocused && 'border-2 border-[color:var(--button-hover-color)] ring-0 bg-white',
              // Estados de error
              error && !isFocused && 'border-red-300 bg-red-50/30',
              error && isFocused && 'border-2 border-red-500 bg-red-50/30 ring-0',
              // Estado disabled
              disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
              // Hover
              !disabled && !isFocused && 'hover:border-gray-300'
            )}
          >
            <span className={clsx(
              'block truncate',
              'block truncate flex items-center',
              !selectedOption && 'text-gray-500'
            )}>
              {Icon && (
                <span className="mr-2 inline-flex text-gray-400">
                  <Icon size={16} />
                </span>
              )}
              {selectedOption?.label || (shouldFloatLabel ? <span className="text-gray-400 font-normal">{placeholder || 'Seleccionar...'}</span> : null)}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </span>
          </Listbox.Button>

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

          <Listbox.Options
            className={clsx(
              'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5',
              'focus:outline-none'
            )}
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active, selected }) =>
                  clsx(
                    'cursor-pointer select-none px-4 py-3',
                    active ? 'bg-[color:var(--button-hover-color)]/10 text-[color:var(--button-hover-color)]' : 'text-gray-900',
                    selected ? 'font-semibold bg-[color:var(--button-hover-color)]/5' : ''
                  )
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span className="truncate">{option.label}</span>
                    {selected && <Check className="w-4 h-4 text-[color:var(--button-hover-color)]" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>

      {/* Error Message - Outside the relative container */}
      {error && (
        <div className="mt-1 text-red-500 text-sm">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
