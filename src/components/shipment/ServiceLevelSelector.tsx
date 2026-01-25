import { CalendarClock, Zap, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceLevelSelectorProps {
  value: 'regular' | 'express' | 'change' | undefined;
  onChange: (value: 'regular' | 'express' | 'change') => void;
  error?: string;
}

export default function ServiceLevelSelector({ value, onChange, error }: ServiceLevelSelectorProps) {
  return (
    <div className="md:col-span-2 mb-6">
      <label className="text-sm font-medium text-gray-700 mb-3 block">
        Tipo de servicio *
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card A: Regular */}
        <div
          onClick={() => onChange('regular')}
          className={clsx(
            "cursor-pointer rounded-xl p-4 border transition-all duration-200 h-full flex flex-col justify-between",
            value === 'regular'
              ? "border-2 border-[#02997d] bg-[#02997d]/5 ring-1 ring-[#02997d]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                value === 'regular' ? "bg-[#02997d] text-white" : "bg-blue-50 text-blue-600"
              )}>
                <CalendarClock size={16} />
              </div>
              <h5 className={clsx("font-semibold text-sm", value === 'regular' ? "text-[#02997d]" : "text-gray-900")}>
                Regular
              </h5>
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              Recojo programado para el día siguiente.
            </p>
          </div>
        </div>

        {/* Card B: Express */}
        <div
          onClick={() => onChange('express')}
          className={clsx(
            "cursor-pointer rounded-xl p-4 border transition-all duration-200 h-full flex flex-col justify-between",
            value === 'express'
              ? "border-2 border-[#02997d] bg-[#02997d]/5 ring-1 ring-[#02997d]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                value === 'express' ? "bg-[#02997d] text-white" : "bg-amber-50 text-amber-600"
              )}>
                <Zap size={16} />
              </div>
              <h5 className={clsx("font-semibold text-sm", value === 'express' ? "text-[#02997d]" : "text-gray-900")}>
                Express
              </h5>
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              Prioridad Alta. Recojo el mismo día.
            </p>
          </div>
        </div>

        {/* Card C: Cambio */}
        <div
          onClick={() => onChange('change')}
          className={clsx(
            "cursor-pointer rounded-xl p-4 border transition-all duration-200 h-full flex flex-col justify-between",
            value === 'change'
              ? "border-2 border-[#02997d] bg-[#02997d]/5 ring-1 ring-[#02997d]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                value === 'change' ? "bg-[#02997d] text-white" : "bg-teal-50 text-teal-600"
              )}>
                <RefreshCw size={16} />
              </div>
              <h5 className={clsx("font-semibold text-sm", value === 'change' ? "text-[#02997d]" : "text-gray-900")}>
                Cambio
              </h5>
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              Entrega y recojo simultáneo (Logística Inversa).
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>
      )}
    </div>
  );
}
