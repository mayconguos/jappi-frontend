import { Search, Filter, Download, Plus, Box } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RequestsFilterProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  onNewRequest: () => void;
  onExport: () => void;
  totalItems: number;
}

export default function RequestsFilter({
  statusFilter,
  setStatusFilter,
  searchValue,
  setSearchValue,
  onNewRequest,
  onExport,
  totalItems,
}: RequestsFilterProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50" />
      </div>

      <div className="flex flex-col lg:flex-row items-end gap-4 relative z-10 w-full xl:w-auto">
        <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select
              label="Estado"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'Todos', value: 'all' },
                { label: 'Pendientes', value: 'pending' },
                { label: 'En Tránsito', value: 'in_transit' },
                { label: 'Recibidos', value: 'received' },
              ]}
              icon={Filter}
              className="bg-white border-slate-200"
            />
          </div>

          {/* Search */}
          <div className="w-full sm:w-64">
            <Input
              label="Buscar Orden"
              placeholder="ID de Orden..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              icon={Search}
              className="bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100 flex-wrap justify-between sm:justify-end w-full xl:w-auto">
        {/* Total Badge */}
        <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-sm font-medium text-blue-700 shadow-sm flex items-center gap-2">
          <Box size={14} />
          Total Solicitudes: <span className="text-blue-900 font-bold">{totalItems}</span>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={onExport}
            size="icon"
            className="border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all h-10 w-10"
            title="Exportar Lista"
          >
            <Download size={18} />
          </Button>

          <Button
            onClick={onNewRequest}
            className="bg-[#02997d] hover:bg-[#027a64] text-white shadow-lg shadow-emerald-100 px-6 h-10 gap-2"
          >
            <Plus size={18} />
            <span className="font-medium">Nueva Solicitud</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
