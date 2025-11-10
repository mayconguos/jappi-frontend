import { FileSpreadsheet, FileText } from 'lucide-react';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterField {
  value: string;
  label: string;
}

interface CompaniesFilterProps {
  field: string;
  setField: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
  filterFields: FilterField[];
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export default function CompaniesFilter({
  field,
  setField,
  value,
  setValue,
  filterFields,
  onExportExcel,
  onExportPdf
}: CompaniesFilterProps) {
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
            placeholder="Valor a buscar..."
            value={value}
            onChange={setValue}
            size="compact"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onExportExcel}
          className="text-green-600 hover:text-green-800 p-2 h-full"
          title="Descargar en Excel"
        >
          <FileSpreadsheet />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onExportPdf}
          className="text-red-600 hover:text-red-800 p-2 h-full"
          title="Descargar en PDF"
        >
          <FileText />
        </Button>
      </div>
    </div>
  );
}
