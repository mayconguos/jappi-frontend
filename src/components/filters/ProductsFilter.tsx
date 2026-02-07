
import { Search, Plus, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductsFilterProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  onAdd: () => void;
  onImport: () => void;
  totalItems: number;
}

export default function ProductsFilter({
  searchValue,
  setSearchValue,
  onAdd,
  onImport,
  totalItems,
}: ProductsFilterProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full xl:w-auto">
        {/* Search Bar - Expanded width for products */}
        <div className="w-full sm:w-96">
          <Input
            label="Búsqueda"
            placeholder="Buscar por Nombre o SKU..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            icon={Search}
            className="bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100 flex-wrap justify-between sm:justify-end w-full xl:w-auto">
        {/* Total Badge */}
        <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Total: <span className="text-slate-900 font-bold">{totalItems}</span>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={onImport}
            className="flex-1 sm:flex-none gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Importar Excel</span>
            <span className="sm:hidden">Importar</span>
          </Button>

          <Button
            onClick={onAdd}
            className="flex-1 sm:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo Producto</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
