import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MapPin, Settings2 } from 'lucide-react';
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent text-gray-500">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider w-[250px]">Transportista</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Zonas de Recojo</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Zonas de Envío</TableHead>
            <TableHead className="w-[120px] text-right pr-6 text-xs font-semibold uppercase tracking-wider">Zonas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {couriers.map((courier, index) => (
            <TableRow
              key={courier.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              
              <TableCell className="py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900">{courier.first_name} {courier.last_name || ''}</span>
                  <span className="text-[11px] text-gray-400 uppercase font-bold tracking-tight">{courier.vehicle_type} - {courier.plate_number}</span>
                </div>
              </TableCell>

              <TableCell className="py-4">
                <div className="flex flex-wrap gap-1">
                  {courier.pickup_zones.length > 0 ? (
                    courier.pickup_zones.map((zone, zIdx) => (
                      <span 
                        key={zIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold uppercase"
                      >
                        <MapPin size={10} />
                        {zone.district_name} {zone.sector_name ? `(${zone.sector_name})` : ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Sin zonas asignadas</span>
                  )}
                </div>
              </TableCell>

              <TableCell className="py-4">
                <div className="flex flex-wrap gap-1">
                  {courier.delivery_zones.length > 0 ? (
                    courier.delivery_zones.map((zone, zIdx) => (
                      <span 
                        key={zIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase"
                      >
                        <MapPin size={10} />
                        {zone.district_name} {zone.sector_name ? `(${zone.sector_name})` : ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Sin zonas asignadas</span>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-right pr-6 py-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onManageZones(courier)}
                  className="h-8 gap-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 font-normal"
                >
                  <Settings2 size={14} />
                  <span className="text-xs">Gestionar</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {couriers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-300 text-6xl opacity-50 italic">📍</span>
                  <p className="text-sm font-medium">No se encontraron transportistas</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
