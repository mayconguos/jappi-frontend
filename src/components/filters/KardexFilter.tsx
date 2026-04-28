import { Search, Download, FileText, Calendar as CalendarIcon, Filter, RefreshCw } from 'lucide-react';
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
}: Readonly<KardexFilterProps>) {

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32" />
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4 relative z-10">
        
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full" 
            placeholder="Buscar por SKU o nombre..." 
            icon={Search}
          />
        </div>

        {/* Filtros rápidos & Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Movement Type Toggle */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-inner h-10">
            <button
              onClick={() => setMovementType('all')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${movementType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setMovementType('IN')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${movementType === 'IN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Entradas
            </button>
            <button
              onClick={() => setMovementType('OUT')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${movementType === 'OUT' ? 'bg-rose-50 text-rose-700 border border-rose-100/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Salidas
            </button>
          </div>

          {/* Date Picker Container Standardized */}
          <div className="flex items-center border border-gray-300 rounded-lg p-1 h-10 bg-white relative shadow-sm transition-all duration-200 ease-in-out focus-within:border-[#02997d] focus-within:ring-2 focus-within:ring-[#02997d]/20">
             <CalendarIcon size={14} className="text-gray-400 ml-2" />
             <input
               type="date"
               value={dateRange.from || ''}
               onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
               className="text-[13px] pl-2 pr-2 py-1 focus:outline-none bg-transparent border-none w-[115px] cursor-pointer text-gray-900 font-medium font-sans"
             />
             <span className="text-gray-300 text-xs">-</span>
             <input
               type="date"
               value={dateRange.to || ''}
               onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
               className="text-[13px] px-2 py-1 focus:outline-none bg-transparent border-none w-[115px] cursor-pointer text-gray-900 font-medium font-sans"
             />
             {(dateRange.from || dateRange.to) && (
               <button 
                 onClick={() => setDateRange({ from: undefined, to: undefined })}
                 className="text-xs text-gray-400 hover:text-red-500 px-2 border-l border-gray-100 h-full"
                 title="Limpiar fechas"
               >
                 X
               </button>
             )}
          </div>
        </div>
      </div>
      
      {/* Footer del Filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50 relative z-10 font-sans">
        <div className="flex items-center gap-3">
           <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-[13px] font-medium text-emerald-700 shadow-sm flex items-center gap-2">
             <Filter size={14} className="text-emerald-500" />
             <span className="text-emerald-900 font-bold">{totalItems}</span> movimientos encontrados
           </div>
           
           <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 italic">
             <RefreshCw size={12} className="animate-spin-slow" />
             Sincronizado
           </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            onClick={onExportExcel} 
            className="flex-1 sm:flex-none h-9 gap-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-all font-medium text-xs shadow-sm"
          >
            <Download size={14} />
            Excel
          </Button>

          <Button 
            variant="secondary" 
            onClick={onExportPdf} 
            className="flex-1 sm:flex-none h-9 gap-2 border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all font-medium text-xs shadow-sm"
          >
            <FileText size={14} />
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
