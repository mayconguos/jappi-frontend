import { Search, Filter, UserPlus } from 'lucide-react';
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
}

export default function WorkersFilter({
  field,
  setField,
  value,
  setValue,
  filterFields,
  onAdd,
}: WorkersFilterProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
      {/* Background decoration */}
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
            className="bg-slate-50 border-slate-200"
          />
        </div>
        <div className="w-full sm:w-80">
          <Input
            label="Búsqueda"
            placeholder="Escribe para buscar..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            icon={Search}
            className="bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      <div className="relative z-10 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100">
        <Button
          onClick={onAdd}
          className="w-full sm:w-auto bg-[color:var(--surface-dark)] hover:bg-[#0f2e2e] text-white flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
        >
          <UserPlus size={18} />
          <span>Añadir usuario</span>
        </Button>
      </div>
    </div>
  );
}
