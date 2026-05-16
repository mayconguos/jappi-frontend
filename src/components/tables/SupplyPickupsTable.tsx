import { ShieldCheck, Package, Clock, FileText, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Pickup } from '@/types/pickup';

interface SupplyPickupsTableProps {
  pickups: Pickup[];
  currentPage: number;
  itemsPerPage: number;
  onValidate: (pickup: Pickup) => void;
}

export default function SupplyPickupsTable({
  pickups,
  currentPage,
  itemsPerPage,
  onValidate,
}: SupplyPickupsTableProps) {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-2 py-3 text-center w-10">#</th>
              <th className="px-4 py-3 w-[80px]">ID</th>
              <th className="px-4 py-3">Remitente / Solicitud</th>
              <th className="px-4 py-3 text-center w-[110px]">Fecha</th>
              <th className="px-4 py-3">Dirección de Recojo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pickups.map((pickup, index) => {
              return (
                <tr
                  key={pickup.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-2 py-3 whitespace-nowrap text-center font-mono text-[11px] font-bold text-slate-300">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-sm font-semibold text-slate-700">
                    #{pickup.id}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{pickup.seller}</span>
                      <span className="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 shadow-sm px-2 py-0.5 rounded-md inline-flex items-center gap-1 w-max">
                        <FileText size={10} /> Solicitud base #{pickup.id}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                      {pickup.pickup_date}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2 max-w-[250px]">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                        <MapPin size={13} className="text-slate-500" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[13px] font-medium text-slate-700 leading-snug line-clamp-2" title={pickup.address}>
                          {pickup.address}
                        </p>
                        <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                          {pickup.district}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex gap-1.5 items-center w-max px-2.5 py-1 rounded-full shadow-sm">
                      <Clock size={12} /> Pendiente de Aprobación
                    </Badge>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button
                      size="sm"
                      onClick={() => onValidate(pickup)}
                      className="h-8 px-3 gap-1.5 transition-all w-full sm:w-auto text-[11px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-lg"
                    >
                      <ShieldCheck size={14} /> Aprobar
                    </Button>
                  </td>
                </tr>
              );
            })}
            
            {pickups.length === 0 && (
              <tr>
                <td colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No hay recojos de abastecimiento</h3>
                    <p className="text-slate-500">No se encontraron recojos de abastecimiento con los filtros actuales.</p>
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

