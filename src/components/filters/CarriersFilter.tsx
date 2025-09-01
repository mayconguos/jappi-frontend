import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterField {
  value: string;
  label: string;
}

interface CarriersFilterProps {
  field: string;
  setField: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
  filterFields: FilterField[];
  onAdd: () => void;
}

export default function CarriersFilter({
  field,
  setField,
  value,
  setValue,
  filterFields,
  onAdd
}: CarriersFilterProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="flex flex-col md:flex-row md:items-end gap-2 flex-1">
        <div className="flex flex-col gap-1 w-full md:w-44">
          <label className="text-sm font-medium text-gray-700">Buscar por</label>
          <Select
            value={field}
            onChange={setField}
            options={filterFields}
          />
        </div>
        <div className="flex flex-col gap-1 w-full md:w-64">
          <label className="text-sm font-medium text-gray-700">Valor</label>
          <Input
            placeholder="Valor a buscar..."
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </div>
      </div>
      <div className="pt-[22px] md:pt-0">
        <Button
          onClick={onAdd}
          className="bg-primary text-white"
        >
          Añadir transportista
        </Button>
      </div>
    </div>
  );
}
