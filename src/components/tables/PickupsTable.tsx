import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Package, MessageSquareWarning, XCircle, Loader2, Phone, Calendar } from 'lucide-react';
import { Pickup, PickupStatus, Courier } from '@/app/dashboard/pickups/page';
import { Select } from '@/components/ui/select';

interface PickupsTableProps {
  pickups: Pickup[];
  currentPage: number;
  selectedIds: number[];
  onSelectAll: (ids: number[]) => void;
  onSelectOne: (id: number) => void;
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
  selectedIds,
  onSelectAll,
  onSelectOne,
  onView,
  onStatusChange,
  onCarrierChange,
  onCancel,
  couriers,
  isFetchingCouriers,
  onFetchCouriers,
}: PickupsTableProps) {
  const statusOptions = Object.entries(STATUS_META)
    .filter(([value]) => value !== 'picked_up') 
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

  const allSelected = pickups.length > 0 && selectedIds.length === pickups.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative transition-all">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            {/* Multi-select Header */}
            <TableHead className="w-[45px] pl-6">
              <input 
                type="checkbox" 
                checked={allSelected}
                onChange={() => onSelectAll(pickups.map(p => p.id))}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-transform active:scale-95 cursor-pointer"
              />
            </TableHead>
            <TableHead className="w-[50px] text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">#</TableHead>
            <TableHead className="w-[120px] text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Fecha</TableHead>
            <TableHead className="w-[180px] text-xs font-bold text-slate-400 uppercase tracking-widest">Vendedor / Cliente</TableHead>
            <TableHead className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Ubicación de Recojo</TableHead>
            <TableHead className="w-[110px] text-xs font-bold text-slate-400 uppercase tracking-widest">Origen</TableHead>
            <TableHead className="w-[180px] text-xs font-bold text-slate-400 uppercase tracking-widest">Transportista</TableHead>
            <TableHead className="w-[80px] text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Pedidos</TableHead>
            <TableHead className="w-[160px] text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</TableHead>
            <TableHead className="w-[100px] text-right pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickups.map((pickup, index) => {
            const isSelected = selectedIds.includes(pickup.id);
            return (
              <TableRow
                key={pickup.id}
                className={`border-b border-gray-50 hover:bg-slate-50/50 transition-all group ${
                  isSelected ? 'bg-emerald-50/40 border-emerald-100' : ''
                }`}
              >
                <TableCell className="pl-6 py-4">
                   <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => onSelectOne(pickup.id)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-transform active:scale-95 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="py-4 pl-2 font-mono text-[11px] font-bold text-slate-300">
                  {(currentPage - 1) * 10 + index + 1}
                </TableCell>

                <TableCell className="py-4 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    {pickup.pickup_date}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                      {pickup.seller}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                      <Phone size={12} className="shrink-0 text-slate-400" />
                      <span className="text-xs font-mono font-bold tracking-tight">
                        {pickup.phone}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-1.5 max-w-[340px]">
                    <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                      {pickup.district}
                    </span>
                    <div className="flex items-start gap-1.5 group/addr opacity-70 hover:opacity-100 transition-opacity">
                      <MapPin size={11} className="text-slate-300 shrink-0 mt-1" />
                      <p className="text-xs font-medium text-slate-500 leading-snug break-words italic pl-0.5" title={pickup.address}>
                        {pickup.address}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                    pickup.origin === 'warehouse' 
                    ? 'bg-slate-50 text-slate-600 border-slate-100' 
                    : 'bg-white text-emerald-600 border-emerald-100'
                  }`}>
                    {pickup.origin === 'warehouse' ? 'Sol. Abast.' : 'Envío'}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <div
                    className="flex items-center gap-2 relative group-select"
                    onClick={() => (couriers.length === 0 && pickup.status !== 'received') && onFetchCouriers()}
                  >
                    <Select
                      size="compact"
                      value={pickup.carrier}
                      onChange={(val) => onCarrierChange(pickup.id, val)}
                      options={carrierOptions}
                      className="w-full min-w-[160px] border-slate-200 shadow-sm"
                      disabled={isFetchingCouriers || pickup.status === 'received'}
                    />
                    {isFetchingCouriers && pickup.status !== 'received' && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <Loader2 size={13} className="animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <div className="inline-flex flex-col items-center justify-center min-w-[32px] h-8 rounded-xl bg-slate-50 text-xs font-black text-slate-800 border border-slate-200/60 shadow-inner">
                    {pickup.packages}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <Select
                      size="compact"
                      value={pickup.status}
                      onChange={(val) => onStatusChange(pickup.id, val as PickupStatus)}
                      options={statusOptions}
                      className="w-full min-w-[130px] border-slate-200 shadow-sm"
                      disabled={pickup.status === 'received'}
                    />
                    {pickup.observation && (
                      <span title={pickup.observation} className="text-amber-500 cursor-help active:scale-90 transition-transform">
                        <MessageSquareWarning size={14} />
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onView(pickup)}
                      className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg hover:shadow-md hover:shadow-indigo-100 transition-all"
                      title="Ver Detalle"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onCancel(pickup.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg hover:shadow-md hover:shadow-red-100 transition-all"
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
              <TableCell colSpan={10} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Package className="text-slate-200" size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No se encontraron recojos</p>
                    <p className="text-xs text-slate-300 mt-1">Intenta ajustando los filtros de búsqueda.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
