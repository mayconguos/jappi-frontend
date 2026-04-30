'use client';

import { useState } from 'react';

import { MapPin, MessageCircle, Phone, Map, Navigation } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import CarrierPickupDetailModal from '@/components/forms/modals/CarrierPickupDetailModal';

import { CarrierPickup, CarrierPickupStatus } from '@/app/dashboard/carrier/pickups/page';

// ─── Helpers de UI ─────────────────────────────────────────────
const getStatusBadge = (status: CarrierPickupStatus) => {
  switch (status) {
    case 'pending':   return <Badge variant="warning">Por recoger</Badge>;
    case 'scheduled': return <Badge variant="info">Programado</Badge>;
    case 'picked_up': return <Badge variant="success">Recogido</Badge>;
    case 'received':  return <Badge variant="outline">Recibido</Badge>;
    default:          return <Badge variant="outline">Desconocido</Badge>;
  }
};

const STATUS_ORDER: Record<CarrierPickupStatus, number> = {
  pending: 0, scheduled: 1, picked_up: 2, received: 3,
};

// ─── Adaptador de CarrierPickup → formato esperado por PickupDetailModal ─
const toModalPickup = (p: CarrierPickup) => ({
  id: p.id,
  status: p.status,
  sender: p.company_name,
  sender_phone: p.phone,
  origin: p.address,
  district: p.district_name,
  items_count: 0,       // la API aún no devuelve este dato
  date: p.pickup_date,
});

interface CarrierPickupsTableProps {
  pickups: CarrierPickup[];
  isConfirming: boolean;
  onConfirmPickup: (pickupId: number) => Promise<void>;
}

export default function CarrierPickupsTable({ pickups, isConfirming, onConfirmPickup }: Readonly<CarrierPickupsTableProps>) {
  const [selectedPickup, setSelectedPickup] = useState<CarrierPickup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const districtsWithPending = Array.from(
    new Set(pickups.filter(p => p.status === 'pending').map(p => p.district_name).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  const districts = ['all', ...districtsWithPending];

  const filtered = selectedDistrict === 'all'
    ? pickups
    : pickups.filter(p => p.district_name === selectedDistrict);

  const sortedPickups = [...filtered].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  const handleOpenDetail = (pickup: CarrierPickup) => {
    setSelectedPickup(pickup);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (pickupId: number) => {
    await onConfirmPickup(pickupId);
  };

  const getMapsUrl = (pickup: CarrierPickup) => {
    const query = `${pickup.address}, ${pickup.district_name}, Lima`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getWaText = (pickup: CarrierPickup) =>
    encodeURIComponent(`Hola, soy el motorizado de Jappi Express. Estoy en camino para recoger tu pedido en ${pickup.address}, ${pickup.district_name}.`);

  return (
    <>
      {/* Filtro por Distrito (Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none mb-4">
        {districts.map(district => {
          const isActive = selectedDistrict === district;
          const count = district === 'all'
            ? pickups.length
            : pickups.filter(p => p.district_name === district).length;
          return (
            <button
              key={district}
              onClick={() => setSelectedDistrict(district)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                whitespace-nowrap border transition-all duration-200 shrink-0
                ${isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                }
              `}
            >
              {district === 'all' ? 'Todos' : district}
              <span className={`
                inline-flex items-center justify-center rounded-full text-[10px] font-semibold
                min-w-[16px] h-4 px-1
                ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remitente</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruta (Origen)</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPickups.map((pickup, index) => (
              <TableRow
                key={pickup.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => handleOpenDetail(pickup)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenDetail(pickup);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                  {index + 1}
                </TableCell>
                <TableCell className="py-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                      {pickup.company_name}
                    </span>
                    <span className="text-[11px] text-gray-400">{pickup.origin}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/51${pickup.phone.replaceAll(/\D/g, '')}?text=${getWaText(pickup)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-medium border border-emerald-100"
                      title="WhatsApp"
                    >
                      <MessageCircle size={14} className="fill-emerald-700/10" />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${pickup.phone.replaceAll(/\D/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-100"
                      title="Llamar"
                    >
                      <Phone size={14} className="fill-blue-700/10" />
                      {pickup.phone}
                    </a>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1.5 max-w-[280px]">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate" title={pickup.address}>{pickup.address}</span>
                    </div>
                    {pickup.district_name && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={10} className="shrink-0" />
                        <span>{pickup.district_name}{pickup.sector_name ? ` · ${pickup.sector_name}` : ''}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  {getStatusBadge(pickup.status)}
                </TableCell>
                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={getMapsUrl(pickup)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                      title="Cómo llegar"
                    >
                      <Map size={16} />
                    </a>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil (Cards compactas) */}
      <div className="md:hidden space-y-2">
        {sortedPickups.map((pickup) => {
          const getStatusColor = (status: CarrierPickupStatus) => {
            switch (status) {
              case 'pending':   return 'bg-amber-400';
              case 'scheduled': return 'bg-blue-400';
              case 'picked_up': return 'bg-emerald-500';
              default:          return 'bg-slate-300';
            }
          };

          const statusColor = getStatusColor(pickup.status);

          return (
            <div
              key={pickup.id}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden active:scale-[0.99] transition-transform"
            >
              {/* Botón invisible que cubre toda la card para el detalle */}
              <button
                type="button"
                className="absolute inset-0 z-0 w-full h-full text-left cursor-pointer"
                onClick={() => handleOpenDetail(pickup)}
                aria-label={`Ver detalle de recojo de ${pickup.company_name}`}
              />

              {/* Franja de estado izquierda */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor} z-10`} />

              <div className="pl-3 relative z-10 pointer-events-none">
                {/* Empresa + Acciones rápidas */}
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                    {pickup.company_name}
                  </p>
                  <div className="flex gap-1.5 pointer-events-auto">
                    <a
                      href={getMapsUrl(pickup)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-7 px-2 items-center justify-center gap-1 rounded-full bg-emerald-100 text-emerald-700 shadow-sm active:scale-90 transition-transform text-[10px] font-bold border border-emerald-200"
                    >
                      <Navigation size={12} className="fill-emerald-700/10" />
                      MAPS
                    </a>
                    <a
                      href={`tel:${pickup.phone.replaceAll(/\D/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm active:scale-90 transition-transform"
                    >
                      <Phone size={14} />
                    </a>
                    <a
                      href={`https://wa.me/51${pickup.phone.replaceAll(/\D/g, '')}?text=${getWaText(pickup)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm active:scale-90 transition-transform"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>

                {/* Dirección */}
                <div className="flex items-start gap-1.5 text-[11px] text-gray-600 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                  <span className="line-clamp-1 italic">{pickup.address}</span>
                </div>

                {/* Distrito */}
                {pickup.district_name && (
                  <div className="flex items-start gap-1.5 text-[10px] text-gray-400 font-medium">
                    <MapPin size={10} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="truncate uppercase tracking-tight">
                      {pickup.district_name}{pickup.sector_name ? ` · ${pickup.sector_name}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalle */}
      <CarrierPickupDetailModal
        isOpen={isModalOpen}
        pickup={selectedPickup}
        isConfirming={isConfirming}
        onClose={() => setIsModalOpen(false)}
        onConfirmPickup={handleStatusChange}
      />
    </>
  );
}
