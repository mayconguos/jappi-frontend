'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreditCard } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PAYMENT_METHODS, PAYMENT_FORMS } from '@/constants/formOptions';
import { type ShipmentFormData } from '@/lib/validations/shipment';

interface PaymentSectionProps {
  form: UseFormReturn<ShipmentFormData>;
}

export default function PaymentSection({ form }: PaymentSectionProps) {
  const { formState: { errors }, watch, setValue, trigger } = form;
  const watchedValues = watch();

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="text-green-600" size={20} />
          Método de Pago
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Método de pago *"
              value={watchedValues.service?.payment_method || ''}
              options={PAYMENT_METHODS}
              onChange={async (value) => {
                setValue('service.payment_method', value);
                await trigger('service.payment_method');
              }}
              error={errors.service?.payment_method?.message}
            />
          </div>

          <div>
            <Select
              label="Forma de pago *"
              value={watchedValues.service?.payment_form || ''}
              options={PAYMENT_FORMS}
              onChange={async (value) => {
                setValue('service.payment_form', value);
                await trigger('service.payment_form');
              }}
              error={errors.service?.payment_form?.message}
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="collect_on_delivery"
                checked={watchedValues.service?.collect_on_delivery || false}
                onChange={(e) => {
                  setValue('service.collect_on_delivery', e.target.checked);
                  if (!e.target.checked) {
                    setValue('service.cod_amount', 0);
                  }
                }}
                className="w-4 h-4 text-[color:var(--button-hover-color)] bg-gray-100 border-gray-300 rounded focus:ring-[color:var(--button-hover-color)] focus:ring-2"
              />
              <label htmlFor="collect_on_delivery" className="text-sm font-medium text-gray-700">
                Cobro contra entrega
              </label>
            </div>

            {watchedValues.service?.collect_on_delivery && (
              <div className="md:max-w-sm">
                <Input
                  label="Monto a cobrar (S/) *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={watchedValues.service?.cod_amount?.toString() || ''}
                  onChange={async (value) => {
                    setValue('service.cod_amount', parseFloat(value) || 0);
                    await trigger('service.cod_amount');
                  }}
                  error={errors.service?.cod_amount?.message}
                  placeholder="150.00"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}