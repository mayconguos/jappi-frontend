'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = ({ checked, onChange, label, disabled = false, className }: CheckboxProps) => {
  return (
    <div className={clsx('flex items-start gap-2', className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={clsx(
          'flex h-4 w-4 items-center justify-center rounded border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked ? 'bg-blue-600 border-blue-600' : 'bg-white',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400',
          'mt-0.5 flex-shrink-0'
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </button>
      {label && (
        <label
          className={clsx(
            'text-sm text-gray-700 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
};
