import { Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BatchActionBarProps {
  selectedCount: number;
  onAssignCarrier: () => void;
  onChangeStatus: () => void;
  onClear: () => void;
}

export default function BatchActionBar({
  selectedCount,
  onAssignCarrier,
  onChangeStatus,
  onClear,
}: Readonly<BatchActionBarProps>) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-sm">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-slate-300">Seleccionados</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onAssignCarrier}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest px-5 h-10"
          >
            <Truck size={14} className="mr-2" />
            Asignar Courier
          </Button>
          <Button
            onClick={onChangeStatus}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest px-5 h-10 border border-slate-700"
          >
            <RefreshCw size={14} className="mr-2" />
            Cambiar Estado
          </Button>
          <Button
            variant="ghost"
            onClick={onClear}
            className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-widest h-10"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
