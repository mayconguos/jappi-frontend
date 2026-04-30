'use client';

import { useState, useEffect } from 'react';

import { Eye, MapPin, User, MessageCircle, Phone, Map, Navigation } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import DeliveryDetailModal from '@/components/forms/modals/DeliveryDetailModal';

import { CarrierDelivery } from '@/app/dashboard/carrier/deliveries/page';

interface CarrierDeliveriesTableProps {
  deliveries: CarrierDelivery[];
  onStatusChange: (id: string, status: string) => void;
}

const STATUS_ORDER: Record<CarrierDelivery['status'], number> = {
  pending: 0,
  scheduled: 0,
  completed: 1,
  failed: 2
};

const getStatusBadge = (status: CarrierDelivery['status']) => {
  if (status === 'completed') {
    return <Badge variant="success">Entregado</Badge>;
  }
  if (status === 'failed') {
    return <Badge variant="destructive">Fallido</Badge>;
  }
  return <Badge variant="info">En Ruta</Badge>;
};

export default function CarrierDeliveriesTable({ deliveries, onStatusChange }: Readonly<CarrierDeliveriesTableProps>) {
  const [selectedDelivery, setSelectedDelivery] = useState<CarrierDelivery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const districtsWithPending = Array.from(
    new Set(deliveries.filter(d => d.status === 'pending' || d.status === 'scheduled').map(d => d.district))
  ).sort((a, b) => a.localeCompare(b));
  const districts = ['all', ...districtsWithPending];

  const sorted = [...deliveries]
    .filter(d => selectedDistrict === 'all' || d.district === selectedDistrict)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Restart page on district change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDistrict]);

  const totalItems = sorted.length;
  const currentItems = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getWhatsappMessage = (delivery: CarrierDelivery) => {
    return [
      `Buen día, le saludamos de Japi Express ${String.fromCodePoint(0x1F4E6)}`,
      `Empresa Courier oficial de la tienda *${delivery.origin}* donde realizó su compra.`,
      `Le escribo por este medio para que me haga llegar su ubicación de mapa ${String.fromCodePoint(0x1F4CD)} y poder realizar la entrega con más efectividad.`,
      `${String.fromCodePoint(0x1F550)} Estaremos visitándolo(a) el día de hoy hasta las 07:00 pm aprox.`,
      `${String.fromCodePoint(0x2B50)} ¡Qué tenga un excelente día! ${String.fromCodePoint(0x2B50)}`
    ].join('\n');
  };

  const handleOpenDetail = (delivery: CarrierDelivery) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    onStatusChange(id, newStatus);
    if (selectedDelivery?.id === id) {
      setSelectedDelivery({ ...selectedDelivery, status: newStatus as any });
    }
  };

  return (
    <>
      {/* Filtro por Distrito (Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {districts.map((district) => {
          const isActive = selectedDistrict === district;
          const count = district === 'all'
            ? deliveries.length
            : deliveries.filter(d => d.district === district).length;
          return (
            <button
              key={district}
              onClick={() => setSelectedDistrict(district)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                whitespace-nowrap border transition-all duration-200 shrink-0
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
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

      {/* Vista Desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
              <TableHead className="w-[140px] text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking ID</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinatario</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  No hay entregas en <span className="font-medium text-gray-500">{selectedDistrict}</span>
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((delivery, index) => (
                <TableRow
                  key={delivery.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  onClick={() => handleOpenDetail(delivery)}
                >
                  <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell className="py-4 font-mono text-xs text-blue-700 font-medium h-16">
                    {delivery.id}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 min-w-[2.25rem] rounded-full flex items-center justify-center bg-blue-50 text-blue-600 ring-1 ring-blue-100/50">
                        <User size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[180px]" title={delivery.recipient}>
                        {delivery.recipient}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${delivery.recipient_phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent(getWhatsappMessage(delivery))}`}
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
                        href={`tel:${delivery.recipient_phone.replaceAll(/\D/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-100"
                        title="Llamar"
                      >
                        <Phone size={14} className="fill-blue-700/10" />
                        Llamar
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 max-w-[280px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate" title={delivery.destination}>{delivery.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {getStatusBadge(delivery.status)}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.destination + ', ' + delivery.district + ', Lima')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                        title="Cómo llegar"
                      >
                        <Map size={16} />
                      </a>
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 gap-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-normal"
                        onClick={(e) => { e.stopPropagation(); handleOpenDetail(delivery); }}
                      >
                        <Eye size={16} />
                        <span className="text-xs">Ver</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil (Cards compactas) */}
      <div className="md:hidden space-y-2">
        {sorted.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No hay entregas en <span className="font-medium text-gray-500">{selectedDistrict}</span>
          </div>
        ) : (
          currentItems.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden active:scale-[0.99] transition-transform"
            >
              {/* Botón invisible que cubre toda la card para el detalle */}
              <button
                type="button"
                className="absolute inset-0 z-0 w-full h-full text-left cursor-pointer"
                onClick={() => handleOpenDetail(delivery)}
                aria-label={`Ver detalle de entrega para ${delivery.recipient}`}
              />

              {/* Franja de estado izquierda */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${delivery.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'} z-10`} />

              <div className="pl-3 relative z-10 pointer-events-none">
                {/* Destinatario */}
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{delivery.recipient}</p>
                  <div className="flex gap-1.5 pointer-events-auto">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.destination + ', ' + delivery.district + ', Lima')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-7 px-2 items-center justify-center gap-1 rounded-full bg-blue-100 text-blue-700 shadow-sm active:scale-90 transition-transform text-[10px] font-bold border border-blue-200"
                    >
                      <Navigation size={12} className="fill-blue-700/10" />
                      MAPS
                    </a>
                    <a
                      href={`tel:${delivery.recipient_phone.replaceAll(/\D/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm active:scale-90 transition-transform"
                    >
                      <Phone size={14} />
                    </a>
                    <a
                      href={`https://wa.me/${delivery.recipient_phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent(getWhatsappMessage(delivery))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm active:scale-90 transition-transform"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>

                {/* Dirección - Agregada entre nombre y distrito */}
                <div className="flex items-start gap-1.5 text-[11px] text-gray-600 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                  <span className="line-clamp-1 italic">{delivery.destination}</span>
                </div>

                {/* Distrito */}
                <div className="flex items-start gap-1.5 text-[10px] text-gray-400 font-medium">
                  <MapPin size={10} className="text-gray-400 shrink-0 mt-0.5" />
                  <span className="truncate uppercase tracking-tight">{delivery.district}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalItems > 0 && (
        <div className="flex justify-center sm:justify-end mt-4 pb-4 px-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal de Detalle */}
      <DeliveryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        delivery={selectedDelivery}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

