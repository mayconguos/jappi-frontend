import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface PickupDetailsFormProps {
  originType: 'pickup' | 'stock' | undefined;
  addresses: Array<{ label: string; value: string }>;
  phones: Array<{ label: string; value: string }>;
  addressValue: string;
  onAddressChange: (value: string) => void;
  addressError?: string;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  phoneError?: string;
  pickupCostValue?: number;
  onPickupCostChange?: (value: number) => void;
  pickupCostError?: string;
}

export default function PickupDetailsForm({
  originType,
  addresses,
  phones,
  addressValue,
  onAddressChange,
  addressError,
  phoneValue,
  onPhoneChange,
  phoneError,
  pickupCostValue = 0,
  onPickupCostChange,
  pickupCostError
}: PickupDetailsFormProps) {
  if (originType !== 'pickup') return null;

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-t border-gray-100 pt-4">Datos de Recojo</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
          <Select
            label="Dirección de recojo *"
            value={addressValue || ''}
            options={addresses}
            onChange={onAddressChange}
            error={addressError}
          />
        </div>

        <div className="md:col-span-1">
          <Select
            label="Teléfono de contacto *"
            value={phoneValue || ''}
            options={phones}
            onChange={onPhoneChange}
            error={phoneError}
          />
        </div>

        {/* <div className="flex flex-col md:col-span-1">
          <Input
            label="Costo de recojo"
            type="number"
            prefix="S/"
            placeholder="0.00"
            value={pickupCostValue}
            onChange={(e) => onPickupCostChange?.(Number(e.target.value))}
            error={pickupCostError}
            min={0}
            step="0.01"
          />
        </div> */}
      </div>
    </div>
  );
}
