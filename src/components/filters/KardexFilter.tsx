import { Search, Download, FileText, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface KardexFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateRange: { from: string | undefined; to: string | undefined };
  setDateRange: (range: { from: string | undefined; to: string | undefined }) => void;
  movementType: string;
  setMovementType: (type: string) => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  totalItems: number;
}

export default function KardexFilter({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  movementType,
  setMovementType,
  onExportExcel,
  onExportPdf,
  totalItems
}: KardexFilterProps) {

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full" 
            placeholder="Buscar por nombre..." 
          />
        </div>

        {/* Filtros rápidos & Botones export */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-2 border border-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setMovementType('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${movementType === 'all' ? 'bg-slate-100 text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setMovementType('IN')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${movementType === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Entradas
            </button>
            <button
              onClick={() => setMovementType('OUT')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${movementType === 'OUT' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Salidas
            </button>
          </div>

          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white relative">
             <CalendarIcon size={16} className="text-gray-400 absolute left-3" />
             <input
               type="date"
               value={dateRange.from || ''}
               onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
               className="text-sm pl-8 pr-2 py-1 focus:outline-none bg-transparent rounded border-none w-32 cursor-pointer"
             />
             <span className="text-gray-400 text-xs">-</span>
             <input
               type="date"
               value={dateRange.to || ''}
               onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
               className="text-sm px-2 py-1 focus:outline-none bg-transparent rounded border-none w-32 cursor-pointer"
             />
             {(dateRange.from || dateRange.to) && (
               <button 
                 onClick={() => setDateRange({ from: undefined, to: undefined })}
                 className="text-xs text-gray-500 hover:text-red-500 px-2 border-l border-gray-200"
                 title="Limpiar fechas"
               >
                 X
               </button>
             )}
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

          <button onClick={onExportExcel} className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" title="Exportar Excel">
            <Download size={16} className="text-emerald-600" />
            <span className="hidden lg:inline">Excel</span>
          </button>

          <button onClick={onExportPdf} className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" title="Exportar PDF">
            <FileText size={16} className="text-red-500" />
            <span className="hidden lg:inline">PDF</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
           <Filter size={14} />
           <span>Mostrando <span className="font-semibold text-gray-900">{totalItems}</span> movimientos encontrados</span>
        </div>
      </div>
    </div>
  );
}
