import { Package, Truck, CheckCircle2 } from 'lucide-react';
import { Dispatch } from '@/types/dispatch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DispatchesTableProps {
  dispatches: Dispatch[];
  currentPage: number;
  selectedIds?: number[];
  onSelectOne?: (id: number) => void;
  onSelectAll?: (ids: number[]) => void;
  onStatusChange: (id: number, status: string) => void;
  showSelection?: boolean;
}

export default function DispatchesTable({
  dispatches,
  currentPage,
  selectedIds = [],
  onSelectOne,
  onSelectAll,
  onStatusChange,
  showSelection = false,
}: Readonly<DispatchesTableProps>) {
  const allSelected = dispatches.length > 0 && selectedIds.length === dispatches.length;

  const getStatusDispatchBadge = (status: string, origin: string) => {
    switch (status) {
      case 'to_dispatch': {
        const label = origin === 'stock' ? 'Por Preparar' : 'Por Despachar';
        return <Badge variant="warning">{label}</Badge>;
      }
      case 'dispatched': {
        const label = origin === 'stock' ? 'Preparado' : 'Despachado';
        return <Badge variant="success">{label}</Badge>;
      }
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOriginBadge = (origin: string) => {
    if (origin === 'stock') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
          <Package size={12} /> Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
        <Truck size={12} /> Recojo
      </span>
    );
  };


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              {showSelection && (
                <th className="pl-4 pr-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => onSelectAll?.(dispatches.map(d => d.id))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-transform active:scale-95 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-2 py-3 text-center w-8">#</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dispatches.map((dispatch, index) => (
              <tr
                key={dispatch.id}
                className={`hover:bg-slate-50/50 transition-colors group ${showSelection && selectedIds.includes(dispatch.id) ? 'bg-emerald-50/40' : ''}`}
              >
                {showSelection && (
                  <td className="pl-4 pr-2 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(dispatch.id)}
                      onChange={() => onSelectOne?.(dispatch.id)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-transform active:scale-95 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-2 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-slate-400 text-[10px]"> {(currentPage - 1) * 10 + index + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-xs uppercase tracking-tight">{dispatch.shipping_date}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-slate-600 font-medium">
                    {dispatch.company_name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-800">{dispatch.product_name}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getOriginBadge(dispatch.origin_type)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusDispatchBadge(dispatch.status_dispatch, dispatch.origin_type)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  {dispatch.status_dispatch === 'to_dispatch' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onStatusChange(dispatch.id, 'dispatched')}
                      className="h-8 gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg transition-all"
                    >
                      <CheckCircle2 size={14} />
                      <span className="hidden sm:inline">
                        {dispatch.origin_type === 'stock' ? 'Confirmar Preparación' : 'Confirmar Despacho'}
                      </span>
                    </Button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mr-2">Completado</span>
                  )}
                </td>
              </tr>
            ))}

            {dispatches.length === 0 && (
              <tr>
                <td colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No hay despachos</h3>
                    <p className="text-slate-500">No se encontraron despachos con los filtros actuales.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
