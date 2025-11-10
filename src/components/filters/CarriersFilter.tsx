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
      <div className="flex flex-col md:flex-row md:items-end gap-4 flex-1">
        <div className="w-full md:w-48">
          <Select
            label="Buscar por"
            value={field}
            onChange={setField}
            options={filterFields}
            size="compact"
          />
        </div>
        <div className="w-full md:w-64">
          <Input
            label="Valor"
            value={value}
            onChange={setValue}
            size="compact"
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
