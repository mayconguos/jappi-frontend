import { UseFormReturn } from 'react-hook-form';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      "transition-all duration-500 ease-in-out",
      isActive ? "opacity-100 translate-y-0" : (isCompleted ? "opacity-60" : "opacity-40 translate-y-4 pointer-events-none")
    )}>
      <Card className={clsx(
        "border-gray-200 shadow-sm bg-white",
        isActive ? "overflow-visible" : "overflow-hidden"
      )}>

        {/* HEADER */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-[#02997d]/10 text-[#02997d]"
            )}>
              {isCompleted ? <CheckCircle2 size={18} /> : <span>3</span>}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Método de Pago
              </h3>
              {!isCompleted && <p className="text-xs text-gray-500">Cómo se procesará el cobro</p>}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className={clsx(
          "transition-all duration-500",
          !isActive && !isCompleted ? "max-h-0 py-0 opacity-0 overflow-hidden" : "max-h-[1000px] opacity-100"
        )}>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Método de Pago */}
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

              {/* Forma de Pago */}
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

              {/* Nota: La configuración de montos C.O.D. se maneja en la Sección 1 (ShipmentSection) */}
            </div>

            {/* BOTÓN FINAL */}
            {onSubmit && (
              <div className="pt-8 flex justify-end border-t border-gray-50 mt-4 animate-in fade-in zoom-in duration-500">
                <Button
                  onClick={onSubmit}
                  type="button"
                  disabled={isLoading}
                  className="bg-gray-900 text-white hover:bg-black px-8 h-11 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2"></span> Procesando...
                    </>
                  ) : (
                    <>
                      <span className="mr-2"></span> Confirmar forma de pago
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}