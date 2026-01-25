import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface PickupDetailsFormProps {
  originType: 'pickup' | 'warehouse' | undefined;
  addresses: Array<{ label: string; value: string }>;
  phones: Array<{ label: string; value: string }>;
  addressValue: string;
  onAddressChange: (value: string) => void;
  addressError?: string;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  phoneError?: string;
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
  phoneError
}: PickupDetailsFormProps) {
  const [showCustomAddress, setShowCustomAddress] = useState(false);
  const [showCustomPhone, setShowCustomPhone] = useState(false);

  if (originType !== 'pickup') return null;

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-t border-gray-100 pt-4">Datos de Recojo</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {!showCustomAddress ? (
          <div className="md:col-span-2">
            <Select
              label="Dirección de recojo *"
              value={addressValue || ''}
              options={[
                ...addresses,
                { label: '+ Escribir nueva dirección', value: 'custom' }
              ]}
              onChange={(value) => {
                if (value === 'custom') {
                  setShowCustomAddress(true);
                  onAddressChange('');
                } else {
                  onAddressChange(value);
                }
              }}
              error={addressError}
            />
          </div>
        ) : (
          <div className="space-y-2 md:col-span-2">
            <Input
              label="Dirección de recojo personalizada *"
              value={addressValue || ''}
              onChange={(e) => onAddressChange(e.target.value.toUpperCase())}
              error={addressError}
              placeholder="ESCRIBIR NUEVA DIRECCIÓN"
            />
            <button
              type="button"
              onClick={() => {
                setShowCustomAddress(false);
                onAddressChange('');
              }}
              className="text-xs text-[#02997d] hover:text-emerald-700 font-medium ml-1"
            >
              ← Volver a direcciones guardadas
            </button>
          </div>
        )}

        {!showCustomPhone ? (
          <div>
            <Select
              label="Teléfono de contacto *"
              value={phoneValue || ''}
              options={[
                ...phones,
                { label: '+ Escribir nuevo teléfono', value: 'custom' }
              ]}
              onChange={(value) => {
                if (value === 'custom') {
                  setShowCustomPhone(true);
                  onPhoneChange('');
                } else {
                  onPhoneChange(value);
                }
              }}
              error={phoneError}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              label="Teléfono personalizado *"
              value={phoneValue || ''}
              onChange={(e) => onPhoneChange(e.target.value)}
              error={phoneError}
              placeholder="ESCRIBIR NUEVO TELÉFONO"
            />
            <button
              type="button"
              onClick={() => {
                setShowCustomPhone(false);
                onPhoneChange('');
              }}
              className="text-xs text-[#02997d] hover:text-emerald-700 font-medium ml-1"
            >
              ← Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
