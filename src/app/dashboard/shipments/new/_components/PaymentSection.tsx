'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PAYMENT_METHODS, PAYMENT_FORMS } from '@/constants/formOptions';
import { type ShipmentFormData } from '@/lib/validations/shipment';

interface PaymentSectionProps {
  form: UseFormReturn<ShipmentFormData>;
  isActive: boolean;
  isCompleted?: boolean;
  onSubmit?: () => void;
  isLoading?: boolean;
}

export default function PaymentSection({ form, isActive, isCompleted, onSubmit, isLoading }: PaymentSectionProps) {
  const { formState: { errors }, watch, setValue, trigger } = form;
  const watchedValues = watch();

  return (
    <div className={clsx(
      "bg-white rounded-[24px] shadow-sm transition-all duration-500 border",
      isActive ? "overflow-visible" : "overflow-hidden",
      isCompleted ? "border-emerald-200" : (isActive ? "border-[var(--surface-dark)] ring-1 ring-[var(--surface-dark)]/20 shadow-lg" : "border-slate-100 opacity-60")
    )}>
      <div
        className={clsx(
          "px-8 py-6 flex items-center justify-between border-b transition-colors duration-300",
          isCompleted ? "bg-emerald-50 border-emerald-100" : (isActive ? "bg-white border-slate-100" : "bg-slate-50 border-transparent")
        )}
      >
        <div className="flex items-center gap-4">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            isCompleted ? "bg-emerald-500 text-white shadow-emerald-200" : (isActive ? "bg-[var(--surface-dark)] text-white shadow-lg shadow-[var(--surface-dark)]/30" : "bg-slate-200 text-slate-400")
          )}>
            {isCompleted ? <CheckCircle2 size={24} /> : <CreditCard size={20} />}
          </div>
          <div>
            <h3 className={clsx("text-lg font-bold transition-colors", isCompleted ? "text-emerald-800" : "text-slate-900")}>
              Método de Pago
            </h3>
            <p className="text-sm text-slate-500">
              {isCompleted ? "Pago configurado" : "Cómo se cobrará el servicio"}
            </p>
          </div>
        </div>
      </div>

      <div className={clsx(
        "transition-all duration-500 ease-in-out opacity-100 max-h-[1000px]",
        !isActive && "pointer-events-none opacity-80 grayscale-[0.3] overflow-hidden",
        isActive && "overflow-visible"
      )}>
        <div className="p-8 space-y-8">
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
                  className="w-5 h-5 text-[var(--surface-dark)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--surface-dark)] focus:ring-2 cursor-pointer"
                />
                <label htmlFor="collect_on_delivery" className="text-base font-bold text-gray-700 cursor-pointer">
                  Cobro contra entrega (C.O.D.)
                </label>
              </div>

              {watchedValues.service?.collect_on_delivery && (
                <div className="md:max-w-sm ml-8 animate-in slide-in-from-top-2">
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

          {/* Botón Final */}
          {onSubmit && (
            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <Button
                onClick={onSubmit}
                type="button"
                disabled={isLoading}
                className="bg-[var(--surface-dark)] hover:bg-[var(--surface-dark)]/90 text-white h-14 px-10 rounded-2xl shadow-xl shadow-[var(--surface-dark)]/20 hover:shadow-2xl hover:scale-105 transition-all text-lg font-bold"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Registrando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span> Registrar Envío
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}