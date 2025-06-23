'use client';

import * as React from 'react';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  className?: string;
}

export const Select = ({ value, onChange, options, label, className }: SelectProps) => {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className='flex flex-col gap-1 w-full'>
      {label && <label className='text-sm font-medium text-gray-700'>{label}</label>}
      <Listbox value={value} onChange={onChange}>
        <div className='relative'>
          <Listbox.Button
            className={clsx(
              'h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'flex items-center justify-between gap-2',
              className
            )}
          >
            <span>{selectedOption?.label || 'Seleccionar...'}</span>
            <ChevronDown className='w-4 h-4 text-gray-500' />
          </Listbox.Button>

          <Listbox.Options
            className={clsx(
              'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5',
              'focus:outline-none'
            )}
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active, selected }) =>
                  clsx(
                    'cursor-pointer select-none px-4 py-2',
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                    selected ? 'font-semibold' : ''
                  )
                }
              >
                {({ selected }) => (
                  <div className='flex items-center justify-between'>
                    <span>{option.label}</span>
                    {selected && <Check className='w-4 h-4 text-blue-600' />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};
