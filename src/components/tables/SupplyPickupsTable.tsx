import { ShieldCheck, Truck, Package, Clock, FileText, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="w-[50px] pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="w-[80px] text-xs font-bold text-gray-500 uppercase tracking-wider">ID</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remitente / Solicitud</TableHead>
            <TableHead className="w-[110px] text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Fecha</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección de Recojo</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</TableHead>
            <TableHead className="w-[140px] text-right pr-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickups.map((pickup, index) => {

            return (
              <TableRow
                key={pickup.id}
                className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors group"
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="py-4 font-mono text-sm font-semibold text-gray-700">
                  #{pickup.id}
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">{pickup.seller}</span>
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-flex items-center gap-1 w-max">
                      <FileText size={10} /> Solicitud base #{pickup.id}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                    {pickup.pickup_date}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-start gap-2 max-w-[250px]">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-1" title={pickup.address}>
                        {pickup.address}
                      </p>
                      <p className="text-xs text-gray-500">{pickup.district}</p>
                    </div>
                  </div>
                </TableCell>



                <TableCell className="py-4">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex gap-1.5 items-center w-max">
                    <Clock size={12} /> Pendiente de Aprobación
                  </Badge>
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <Button
                    size="sm"
                    onClick={() => onValidate(pickup)}
                    className="h-8 px-3 gap-1.5 transition-all w-full text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <ShieldCheck size={14} /> Aprobar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {pickups.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Package size={32} className="text-gray-300" />
                  <p className="text-sm">No hay aprobaciones de recojo pendientes</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
