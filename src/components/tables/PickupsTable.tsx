import { Eye, MapPin, Package, MessageSquareWarning, XCircle, Loader2, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Select } from '@/components/ui/select';

import { Pickup, PickupStatus } from '@/types/pickup';
import { Courier } from '@/types/courier';

// ─── Mode ──────────────────────────────────────────────────────────────────────
// 'admin'    → todas las columnas + acciones de admin (select, carrier dropdown, status dropdown, cancelar)
// 'company'  → vista de empresa: sin select, carrier/status en modo lectura, solo "Ver"
// 'readonly' → igual que company pero sin ninguna acción
export type TableMode = 'admin' | 'company' | 'readonly';

// ─── Props ─────────────────────────────────────────────────────────────────────
interface PickupsTableProps {
  mode?: TableMode;
  pickups: Pickup[];
  currentPage: number;
  onView?: (pickup: Pickup) => void;

  // Admin-only (opcionales)
  selectedIds?: number[];
  onSelectAll?: (ids: number[]) => void;
  onSelectOne?: (id: number) => void;
  onStatusChange?: (id: number, status: PickupStatus) => void;
  onCarrierChange?: (id: number, carrierIdStr: string) => void;
  onCancel?: (id: number) => void;
  couriers?: Courier[];
  isFetchingCouriers?: boolean;
  onFetchCouriers?: () => void;
}

const STATUS_META: Record<PickupStatus, { label: string; badge: string; dot: string }> = {
  pending: { label: 'Pendiente', badge: 'bg-amber-50  text-amber-700  border-amber-100', dot: 'bg-amber-400' },
  scheduled: { label: 'Programado', badge: 'bg-blue-50   text-blue-700   border-blue-100', dot: 'bg-blue-400' },
  picked_up: { label: 'Recogido', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-400' },
  received: { label: 'Recibido', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-400' },
};

export default function PickupsTable({
  mode = 'admin',
  pickups,
  currentPage,
  onView,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  onStatusChange,
  onCarrierChange,
  onCancel,
  couriers = [],
  isFetchingCouriers = false,
  onFetchCouriers,
}: Readonly<PickupsTableProps>) {
  const isAdmin = mode === 'admin';
  const canView = mode !== 'readonly';
  const isCompanyMode = mode === 'company' || mode === 'readonly';

  // ── Opciones de status para el select de admin ─────────────────────────────
  const statusOptions = Object.entries(STATUS_META)
    .filter(([value]) => value !== 'picked_up')
    .map(([value, { label }]) => ({ label, value, }));

  // Get assigned couriers from the pickups array to show as options even if couriers aren't loaded yet
  const assignedCouriers = pickups
    .filter(p => p.id_driver !== null && p.carrier !== 'Sin asignar')
    .map(p => ({ label: p.carrier, value: p.id_driver!.toString() }));

  const fetchedCouriers = couriers.map(c => ({
    label: `${c.first_name} ${c.last_name || ''}`.trim(),
    value: c.id.toString(),
  }));

  const uniqueCouriersMap = new Map<string, { label: string; value: string }>();
  [...assignedCouriers, ...fetchedCouriers].forEach(c => uniqueCouriersMap.set(c.value, c));

  const carrierOptions = [
    { label: 'Sin asignar', value: '0' },
    ...Array.from(uniqueCouriersMap.values())
  ].sort((a, b) => a.label === 'Sin asignar' ? -1 : a.label.localeCompare(b.label));

  const allSelected = pickups.length > 0 && selectedIds.length === pickups.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              {/* Checkbox multi-select — solo admin */}
              {isAdmin && (
                <th className="pl-4 pr-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => onSelectAll?.(pickups.map(s => s.id))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-transform active:scale-95 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-2 py-3 text-center w-8">#</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Origen</th>
              {!isCompanyMode && (
                <th className="px-4 py-3">Transportista</th>
              )}
              <th className="px-4 py-3">Estado</th>
              {(canView || isAdmin) && (
                <th className="px-4 py-3 text-right">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {pickups.map((pickup, index) => {
            const isSelected = selectedIds.includes(pickup.id);
            return (
              <tr
                key={pickup.id}
                className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-emerald-50/40' : ''}`}
              >
                {/* Checkbox — solo admin */}
                {isAdmin && (
                  <td className="pl-4 pr-2 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectOne?.(pickup.id)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-transform active:scale-95 cursor-pointer"
                    />
                  </td>
                )}

                {/* Número correlativo */}
                <td className="px-2 py-3 whitespace-nowrap text-center font-mono text-[11px] font-bold text-slate-300">
                  {(currentPage - 1) * 10 + index + 1}
                </td>

                {/* Fecha */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    {pickup.pickup_date}
                  </span>
                </td>

                {/* Vendedor */}
                <td className="px-4 py-3 whitespace-nowrap">
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
                </td>

                {/* Ubicación */}
                <td className="px-4 py-3">
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
                </td>

                {/* Origen */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${pickup.origin === 'warehouse'
                    ? 'bg-slate-50 text-slate-600 border-slate-100'
                    : 'bg-white text-emerald-600 border-emerald-100'
                    }`}>
                    {pickup.origin === 'warehouse' ? 'Sol. Abast.' : 'Envío'}
                  </span>
                </td>

                {/* Transportista (solo admin) */}
                {!isCompanyMode && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 relative group-select w-full">
                      <Select
                        size="compact"
                        value={pickup.id_driver?.toString() || '0'}
                        onChange={(val) => onCarrierChange?.(pickup.id, val)}
                        onClick={() => (couriers.length === 0 && pickup.status !== 'received' && pickup.status !== 'picked_up') && onFetchCouriers?.()}
                        options={carrierOptions}
                        className="w-full min-w-[160px] border-slate-200 shadow-sm"
                        disabled={isFetchingCouriers || pickup.status === 'received' || pickup.status === 'picked_up'}
                      />
                      {isFetchingCouriers && (pickup.status === 'pending' || pickup.status === 'scheduled') && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          <Loader2 size={13} className="animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Select
                      size="compact"
                      value={pickup.status}
                      onChange={(val) => onStatusChange?.(pickup.id, val as PickupStatus)}
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
                </td>

                {/* Acciones */}
                {(canView || isAdmin) && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      {canView && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onView?.(pickup)}
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg hover:shadow-md hover:shadow-indigo-100 transition-all"
                          title="Ver Detalle"
                        >
                          <Eye size={16} />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onCancel?.(pickup.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg hover:shadow-md hover:shadow-red-100 transition-all"
                          title="Cancelar Recojo"
                        >
                          <XCircle size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}

          {/* Empty state */}
          {pickups.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 10 : 9} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No hay recojos</h3>
                  <p className="text-slate-500">No se encontraron recojos con los filtros actuales.</p>
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
