import { Download, Filter, Search } from 'lucide-react';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterField {
  value: string;
  label: string;
}

interface ShipmentsFilterProps {
  filterFields: FilterField[];
  totalItems: number;
  field: string;
  value: string;
  dateRange: { from: string | undefined; to: string | undefined };
  setField: (value: string) => void;
  setValue: (value: string) => void;
  setDateRange: (range: { from: string | undefined; to: string | undefined }) => void;
  onExportExcel: () => void;
}

export default function ShipmentsFilter({
  filterFields,
  totalItems,
  field,
  value,
  dateRange,
  setField,
  setValue,
  setDateRange,
  onExportExcel
}: ShipmentsFilterProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32" />
      </div>

      <div className="flex flex-col lg:flex-row items-end gap-4 relative z-10 w-full xl:w-auto">
        {/* Date Group */}
        <div className="flex items-end gap-2 w-full sm:w-auto">
          <div className="w-full flex justify-start sm:w-auto flex-col">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Fecha</label>
            <div className="flex items-center border border-gray-300 rounded-lg p-1 h-10 bg-white relative shadow-sm transition-all duration-200 ease-in-out focus-within:border-[#02997d] focus-within:ring-2 focus-within:ring-[#02997d]/20">
              <input
                type="date"
                value={dateRange.from || ''}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="text-sm pl-2 pr-2 py-1 focus:outline-none bg-transparent border-none w-[125px] cursor-pointer text-gray-900 font-medium font-sans"
              />
              <span className="text-gray-300 text-xs">-</span>
              <input
                type="date"
                value={dateRange.to || ''}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="text-sm px-2 py-1 focus:outline-none bg-transparent border-none w-[125px] cursor-pointer text-gray-900 font-medium font-sans"
              />
              {(dateRange.from || dateRange.to) && (
                <button
                  onClick={() => setDateRange({ from: undefined, to: undefined })}
                  className="text-xs text-slate-400 hover:text-red-500 px-2 h-full border-l border-slate-100 transition-colors"
                  title="Limpiar fechas"
                >
                  X
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Group */}
        <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-48">
            <Select
              label="Filtrar por"
              value={field}
              onChange={setField}
              options={filterFields}
              placeholder="Campo"
              icon={Filter}
              className="bg-white border-slate-200"
            />
          </div>
          <div className="w-full sm:w-64">
            <Input
              label="Búsqueda"
              placeholder="Buscar..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              icon={Search}
              className="bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100 flex-wrap justify-between sm:justify-end w-full xl:w-auto">
        {/* Total Badge */}
        <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Total: <span className="text-slate-900 font-bold">{totalItems}</span>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-400 hidden sm:block mr-1">Exportar:</span>
          <Button
            variant="secondary"
            onClick={onExportExcel}
            className="flex items-center gap-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-all"
            size="sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Excel</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
