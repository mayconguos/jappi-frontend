import { Truck, Warehouse } from 'lucide-react';
import { clsx } from 'clsx';

interface ShipmentOriginSelectorProps {
  value: 'pickup' | 'warehouse' | undefined;
  onChange: (value: 'pickup' | 'warehouse') => void;
  error?: string;
}

export default function ShipmentOriginSelector({ value, onChange, error }: ShipmentOriginSelectorProps) {
  return (
    <div className="md:col-span-2 mb-2">
      <label className="text-sm font-medium text-gray-700 mb-3 block">
        ¿Desde dónde envías? *
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Pickup */}
        <div
          onClick={() => onChange('pickup')}
          className={clsx(
            "cursor-pointer rounded-xl p-4 border transition-all duration-200 flex items-start gap-4 h-full",
            value === 'pickup'
              ? "border-2 border-[#02997d] bg-[#02997d]/5 ring-1 ring-[#02997d]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
            value === 'pickup' ? "bg-[#02997d] text-white" : "bg-emerald-100 text-emerald-600"
          )}>
            <Truck size={20} />
          </div>
          <div>
            <h5 className={clsx("font-semibold text-sm mb-1", value === 'pickup' ? "text-[#02997d]" : "text-gray-900")}>
              Con Recojo a Domicilio
            </h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Vamos a tu dirección a recoger los paquetes.
            </p>
          </div>
        </div>

        {/* Card 2: Warehouse */}
        <div
          onClick={() => onChange('warehouse')}
          className={clsx(
            "cursor-pointer rounded-xl p-4 border transition-all duration-200 flex items-start gap-4 h-full",
            value === 'warehouse'
              ? "border-2 border-[#02997d] bg-[#02997d]/5 ring-1 ring-[#02997d]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
            value === 'warehouse' ? "bg-[#02997d] text-white" : "bg-slate-100 text-slate-600"
          )}>
            <Warehouse size={20} />
          </div>
          <div>
            <h5 className={clsx("font-semibold text-sm mb-1", value === 'warehouse' ? "text-[#02997d]" : "text-gray-900")}>
              Desde Almacén Japi
            </h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Usar stock que ya tienes guardado en nuestro almacén.
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
