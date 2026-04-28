import { Search, Filter, UserPlus, EyeOff } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterField {
  value: string;
  label: string;
}

interface WorkersFilterProps {
  field: string;
  setField: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
  filterFields: FilterField[];
  onAdd: () => void;
  totalItems: number;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
}

export default function WorkersFilter({
  field,
  setField,
  value,
  setValue,
  filterFields,
  onAdd,
  totalItems,
  showInactive,
  setShowInactive
}: Readonly<WorkersFilterProps>) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full xl:w-auto">
        <div className="w-full sm:w-56">
          <Select
            label="Filtrar por"
            value={field}
            onChange={setField}
            options={filterFields}
            placeholder="Seleccionar campo"
            icon={Filter}
            className="bg-white border-slate-200"
          />
        </div>
        <div className="w-full sm:w-80">
          <Input
            label="Búsqueda"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            icon={Search}
            className="bg-white border-slate-200"
            placeholder="Escribe para buscar..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100 flex-wrap justify-between sm:justify-end w-full xl:w-auto">
        
        {/* Toggle Ver Inactivos */}
        <label className="flex items-center gap-2 cursor-pointer select-none group border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            <EyeOff size={14} className={showInactive ? 'text-emerald-600' : 'text-slate-400'} />
            <span className={`text-xs font-bold uppercase ${showInactive ? 'text-emerald-700' : 'text-slate-500'}`}>
              Ver inactivos
            </span>
          </div>
        </label>

        <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-sm font-medium text-emerald-700 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Total: <span className="text-emerald-900 font-bold">{totalItems}</span>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

        <Button
          onClick={onAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <UserPlus size={18} />
          <span>Añadir usuario</span>
        </Button>
      </div>
    </div>
  );
}
