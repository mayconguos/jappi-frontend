'use client';

import * as React from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition, Label } from '@headlessui/react';
import { Check, ChevronDown, LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: Option[];
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  size?: 'default' | 'compact';
  placeholder?: string;
  icon?: LucideIcon;
}

export const Select = ({
  value,
  onChange,
  options,
  label,
  error,
  className,
  disabled,
  size = 'default',
  placeholder = 'Seleccionar...',
  icon: Icon
}: SelectProps) => {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Listbox as="div" value={value} onChange={onChange} disabled={disabled} className={cn("w-full relative", className)}>
      {({ open }) => (
        <>
          {label && (
            <Label className="block text-sm font-medium text-gray-700 mb-1.5">
              {label}
            </Label>
          )}

          <ListboxButton
            className={cn(
              'relative w-full cursor-default rounded-lg border bg-white text-left shadow-sm transition-all duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-[#02997d]/20 focus:border-[#02997d]',
              // Padding adjustment for icon
              Icon ? 'pl-10 pr-10' : 'pl-3 pr-10',
              // Sizes
              size === 'compact' ? 'h-8 py-1 text-xs' : 'h-10 py-2 text-sm',
              // Error State
              error
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 text-gray-900',
              // Disabled State
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200',
              // Hover
              // !error && !disabled && 'hover:border-gray-400'
            )}
          >
            {Icon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Icon size={18} />
              </span>
            )}

            <span className={cn('block truncate', !selectedOption && 'text-gray-400')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform duration-200",
                  open && "transform rotate-180"
                )}
                aria-hidden="true"
              />
            </span>
          </ListboxButton>

          <ListboxOptions
            anchor="bottom"
            transition
            className={cn(
              "z-50 w-[var(--button-width)] overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none custom-scrollbar",
              "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
            )}
          >
            {options.map((option) => (
              <ListboxOption
                key={option.value}
                className={({ focus }) =>
                  cn(
                    'relative cursor-default select-none py-2.5 pl-3 pr-9 transition-colors',
                    focus ? 'bg-[#02997d]/10 text-[#02997d]' : 'text-gray-900'
                  )
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={cn(
                        'block truncate',
                        selected ? 'font-semibold text-[#02997d]' : 'font-normal'
                      )}
                    >
                      {option.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#02997d]">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ListboxOption>
            ))}
            {options.length === 0 && (
              <div className="py-2.5 px-3 text-gray-500 italic">No hay opciones</div>
            )}
          </ListboxOptions>

          {/* Error Message */}
          {error && (
            <p className="mt-1.5 text-sm text-red-500 animate-in slide-in-from-top-1 fade-in duration-200">
              {error}
            </p>
          )}
        </>
      )}
    </Listbox>
  );
};
