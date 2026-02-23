import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, User, Package, MessageSquareWarning, XCircle, Loader2 } from 'lucide-react';
import { Pickup, PickupStatus, Courier } from '@/app/dashboard/pickups/page';
import { Select } from '@/components/ui/select';

interface PickupsTableProps {
  pickups: Pickup[];
  currentPage: number;
  onView: (pickup: Pickup) => void;
  onStatusChange: (id: number, status: PickupStatus) => void;
  onCarrierChange: (id: number, carrierName: string) => void;
  onCancel: (id: number) => void;
  couriers: Courier[];
  isFetchingCouriers: boolean;
  onFetchCouriers: () => void;
}

const STATUS_META: Record<PickupStatus, { label: string; badge: string; dot: string }> = {
  pending: { label: 'Pendiente', badge: 'bg-amber-50  text-amber-700  border-amber-100', dot: 'bg-amber-400' },
  scheduled: { label: 'Programado', badge: 'bg-blue-50   text-blue-700   border-blue-100', dot: 'bg-blue-400' },
  picked_up: { label: 'Recogido', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-400' },
  received: { label: 'Recibido', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-400' },
};

export default function PickupsTable({
  pickups,
  currentPage,
  onView,
  onStatusChange,
  onCarrierChange,
  onCancel,
  couriers,
  isFetchingCouriers,
  onFetchCouriers,
}: PickupsTableProps) {
  const statusOptions = Object.entries(STATUS_META)
    .filter(([value]) => value !== 'picked_up') // Admins can't manually set to picked_up
    .map(([value, { label }]) => ({
      label,
      value,
    }));

  const carrierOptions = [
    { label: 'Sin asignar', value: 'Sin asignar' },
    ...couriers.map(c => ({
      label: `${c.first_name} ${c.last_name || ''}`.trim(),
      value: `${c.first_name} ${c.last_name || ''}`.trim(),
    }))
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendedor</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección / Distrito</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transportista</TableHead>
            <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Bultos</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
            <TableHead className="w-[120px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickups.map((pickup, index) => {
            return (
              <TableRow
                key={pickup.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                  {(currentPage - 1) * 10 + index + 1}
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{pickup.seller}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-start gap-2 max-w-[250px]">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 leading-snug line-clamp-1" title={pickup.address}>
                        {pickup.address}
                      </p>
                      <p className="text-xs text-gray-500">{pickup.district}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 w-[240px]">
                  <div
                    className="flex items-center gap-2 relative group-select"
                    onClick={() => (couriers.length === 0 && pickup.status !== 'received') && onFetchCouriers()}
                  >
                    <Select
                      size="compact"
                      value={pickup.carrier}
                      onChange={(val) => onCarrierChange(pickup.id, val)}
                      options={carrierOptions}
                      className="min-w-[200px]"
                      disabled={isFetchingCouriers || pickup.status === 'received'}
                    />
                    {isFetchingCouriers && pickup.status !== 'received' && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm">
                    {pickup.packages}
                  </span>
                </TableCell>

                <TableCell className="py-4 w-[200px]">
                  <div className="flex items-center gap-2">
                    <Select
                      size="compact"
                      value={pickup.status}
                      onChange={(val) => onStatusChange(pickup.id, val as PickupStatus)}
                      options={statusOptions}
                      className="min-w-[150px]"
                      disabled={pickup.status === 'received'}
                    />
                    {pickup.observation && (
                      <span title={pickup.observation} className="text-amber-500 cursor-help">
                        <MessageSquareWarning size={14} />
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onView(pickup)}
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Ver Detalle"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onCancel(pickup.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      title="Cancelar Recojo"
                    >
                      <XCircle size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {pickups.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Package size={32} className="text-gray-300" />
                  <p className="text-sm">No se encontraron recojos</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
