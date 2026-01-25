import { FileSpreadsheet, FileText, Search, Filter } from 'lucide-react';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterField {
  value: string;
  label: string;
}

interface ProductsFilterProps {
  field: string;
  setField: (field: string) => void;
  value: string;
  setValue: (value: string) => void;
  filterFields: FilterField[];
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export default function ProductsFilter({
  field,
  setField,
  value,
  setValue,
  filterFields,
  onExportExcel,
  onExportPdf
}: ProductsFilterProps) {
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

      <div className="flex items-center gap-3 relative z-10 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100">
        <span className="text-sm font-medium text-gray-400 hidden sm:block mr-2">Exportar:</span>
        <Button
          variant="secondary"
          onClick={onExportExcel}
          className="flex items-center gap-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-all"
          size="sm"
        >
          <FileSpreadsheet size={16} />
          <span className="hidden sm:inline">Excel</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onExportPdf}
          className="flex items-center gap-2 border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all"
          size="sm"
        >
          <FileText size={16} />
          <span className="hidden sm:inline">PDF</span>
        </Button>
      </div>
    </div>
  );
}
