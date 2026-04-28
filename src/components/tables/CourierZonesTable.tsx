import { MapPin, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { CourierWithZones } from '@/app/dashboard/accounts/courier-zones/page';

interface CourierZonesTableProps {
  couriers: CourierWithZones[];
  currentPage: number;
  itemsPerPage?: number;
  onManageZones: (courier: CourierWithZones) => void;
}

export default function CourierZonesTable({
  couriers,
  currentPage,
  itemsPerPage = 10,
  onManageZones,
}: Readonly<CourierZonesTableProps>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-2 py-3 text-center w-8">#</th>
              <th className="px-4 py-3">Transportista</th>
              <th className="px-4 py-3">Zonas de Recojo</th>
              <th className="px-4 py-3">Zonas de Envío</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {couriers.map((courier, index) => (
              <tr
                key={courier.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-2 py-3 whitespace-nowrap text-center font-mono text-[11px] font-bold text-slate-300">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-700">
                      {courier.first_name} {courier.last_name || ''}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                      {courier.vehicle_type} • {courier.plate_number}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1.5">
                    {courier.pickup_zones.length > 0 ? (
                      courier.pickup_zones.map((zone) => (
                        <span
                          key={zone.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold uppercase"
                        >
                          <MapPin size={10} className="shrink-0" />
                          {zone.district_name} {zone.sector_name ? `(${zone.sector_name})` : ''}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sin zonas</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {courier.delivery_zones.length > 0 ? (
                      courier.delivery_zones.map((zone) => (
                        <span
                          key={zone.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-bold uppercase"
                        >
                          <MapPin size={10} className="shrink-0" />
                          {zone.district_name} {zone.sector_name ? `(${zone.sector_name})` : ''}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sin zonas</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-right ">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onManageZones(courier)}
                    className="h-8 gap-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition-all"
                  >
                    <Settings2 size={14} />
                    <span className="text-xs">Gestionar</span>
                  </Button>
                </td>
              </tr>
            ))}
            {couriers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <MapPin size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No se encontraron transportistas</p>
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
