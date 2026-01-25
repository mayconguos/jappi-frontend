import { PackageCheck, HandCoins, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/input';
import { UseFormRegisterReturn } from 'react-hook-form';

interface DeliveryConfigurationProps {
  deliveryMode: string | undefined;
  onModeChange: (value: string) => void;
  error?: string;
  registerCodAmount: UseFormRegisterReturn;
  codAmountError?: string;
  deliveryDate: string | undefined;
  onDateChange: (value: string) => void;
  dateError?: string;
}

export default function DeliveryConfiguration({
  deliveryMode,
  onModeChange,
  error,
  registerCodAmount,
  codAmountError,
  deliveryDate,
  onDateChange,
  dateError
}: DeliveryConfigurationProps) {
  return (
    <div className="md:col-span-2 mb-6">
      <label className="text-sm font-medium text-gray-700 mb-3 block">
        Modo de entrega *
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Solo Entrega */}
        <div
          onClick={() => onModeChange('delivery_only')}
          className={clsx(
            "cursor-pointer rounded-xl p-4 border transition-all duration-200 h-full flex flex-col justify-between",
            deliveryMode === 'delivery_only'
              ? "border-2 border-[#02997d] bg-[#02997d]/5 ring-1 ring-[#02997d]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                deliveryMode === 'delivery_only' ? "bg-[#02997d] text-white" : "bg-slate-100 text-slate-600"
              )}>
                <PackageCheck size={16} />
              </div>
              <h5 className={clsx("font-semibold text-sm", deliveryMode === 'delivery_only' ? "text-[#02997d]" : "text-gray-900")}>
                Solo Entrega
              </h5>
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              El motorizado solo entrega el paquete. No realiza ningún cobro.
            </p>
          </div>
        </div>

        {/* Card B: Contra Entrega */}
        <div
          onClick={() => onModeChange('pay_on_delivery')}
          className={clsx(
            "cursor-pointer rounded-xl p-4 border transition-all duration-200 h-full flex flex-col justify-between",
            deliveryMode === 'pay_on_delivery'
              ? "border-2 border-[#02997d] bg-[#02997d]/5 ring-1 ring-[#02997d]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                deliveryMode === 'pay_on_delivery' ? "bg-[#02997d] text-white" : "bg-emerald-100 text-emerald-600"
              )}>
                <HandCoins size={16} />
              </div>
              <h5 className={clsx("font-semibold text-sm", deliveryMode === 'pay_on_delivery' ? "text-[#02997d]" : "text-gray-900")}>
                Contra Entrega
              </h5>
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              Entregamos el producto y cobramos el dinero al destinatario.
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>
      )}

      {/* Layout "Tetris": Collection Amount + Delivery Date Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Column 1: Collection Amount (Conditional) */}
        <div>
          {deliveryMode === 'pay_on_delivery' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 h-full">
              <Input
                label="¿Cuánto debe cobrar el motorizado? *"
                type="number"
                prefix="S/"
                placeholder="0.00"
                {...registerCodAmount}
                error={codAmountError}
              />
            </div>
          )}
        </div>

        {/* Column 2: Delivery Date */}
        <div>
          <div className="relative w-full">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Fecha de entrega *
            </label>
            <div className="relative w-full">
              <input
                type="date"
                value={deliveryDate || ''}
                onChange={(e) => onDateChange(e.target.value)}
                className="block w-full h-10 px-3 py-2 pr-10 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#02997d] appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {dateError && (
              <p className="text-xs text-red-500 mt-1">{dateError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
