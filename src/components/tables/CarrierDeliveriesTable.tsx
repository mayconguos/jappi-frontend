'use client';

import { useState, useMemo } from 'react';
import { Navigation, Phone, MessageCircle, ChevronRight, CheckCircle2, Loader2, CheckSquare, Square } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import DeliveryDetailModal from '@/components/forms/modals/DeliveryDetailModal';

import { CarrierDelivery } from '@/types/courier';

import api from '@/app/services/api';

interface CarrierDeliveriesTableProps {
  deliveries: CarrierDelivery[];
  showFinished: boolean;
  onStatusChange: (id: string, newStatus: CarrierDelivery['status']) => void;
}

const STATUS_ORDER: Record<CarrierDelivery['status'], number> = {
  in_transit: 0,
  scheduled: 1,
  pending: 2,
  delivered: 3,
  cancelled: 4,
  returned: 5
};

const getStatusBadge = (status: CarrierDelivery['status']) => {
  switch (status) {
    case 'delivered':
      return <Badge variant="success" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Enviado</Badge>;
    case 'in_transit':
      return <Badge variant="info" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">En Ruta</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Cancelado</Badge>;
    case 'returned':
      return <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Devuelto</Badge>;
    default:
      return <Badge variant="warning" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Pendiente</Badge>;
  }
};

export default function CarrierDeliveriesTable({ deliveries, showFinished, onStatusChange }: Readonly<CarrierDeliveriesTableProps>) {
  const [selectedDelivery, setSelectedDelivery] = useState<CarrierDelivery | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

  const visibleDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const isFinished = ['delivered', 'cancelled', 'returned'].includes(d.status);
      // Filtro exclusivo: si showFinished es true, vemos SOLO los terminados. Si es false, vemos SOLO los activos.
      return showFinished ? isFinished : !isFinished;
    });
  }, [deliveries, showFinished]);

  const districts = useMemo(() => {
    const d = Array.from(new Set(visibleDeliveries.map(del => del.district_name)));
    return ['all', ...d.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))];
  }, [visibleDeliveries]);

  const filteredItems = useMemo(() => {
    return visibleDeliveries.filter(d => {
      return selectedDistrict === 'all' || d.district_name === selectedDistrict;
    });
  }, [visibleDeliveries, selectedDistrict]);

  const sorted = useMemo(() => {
    return [...filteredItems].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }, [filteredItems]);

  const handleOpenDetail = (delivery: CarrierDelivery) => {
    setSelectedDelivery(delivery);
  };

  const getWhatsappMessage = (delivery: CarrierDelivery) => {
    const isFinished = ['delivered', 'cancelled', 'returned'].includes(delivery.status);
    return isFinished
      ? `Hola ${delivery.customer_name}, le saluda el motorizado de Japi Express. Ya entregamos su pedido de la tienda *${delivery.company_name}*.`
      : `Buen día, le saludamos de Japi Express. Estamos por entregar su pedido de la tienda *${delivery.company_name}*.`;
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectableItems = useMemo(() =>
    filteredItems.filter(item => item.status === 'scheduled' || item.status === 'pending'),
    [filteredItems]
  );

  const isAllSelected = selectableItems.length > 0 && selectableItems.every(item => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableItems.map(i => i.id));
    }
  };

  const handleBulkStartRoute = async () => {
    if (selectedIds.length === 0) return;
    setIsUpdatingBulk(true);
    try {
      // Usamos el mismo patrón que AllShipmentsPage: PUT /shipping/status con array de id_shipping
      await api.put('/shipping/status', selectedIds.map(id => ({ 
        id_shipping: id, 
        status: 'in_transit' 
      })));
      
      selectedIds.forEach(id => onStatusChange(id, 'in_transit'));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error en actualización masiva:', error);
      alert('Hubo un error al iniciar la ruta.');
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Barra de Filtros Minimalista */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {districts.map((district) => {
            const isActive = selectedDistrict === district;
            const count = district === 'all'
              ? visibleDeliveries.length
              : visibleDeliveries.filter(d => d.district_name === district).length;
            return (
              <button
                key={district}
                onClick={() => setSelectedDistrict(district)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {district === 'all' ? 'Todos' : district} ({count})
              </button>
            );
          })}
        </div>

        {selectableItems.length > 1 && (
          <div className="pt-2 border-t border-gray-50 flex justify-end">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 active:scale-95 transition-all"
            >
              {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              Seleccionar Todo
            </button>
          </div>
        )}
      </div>

      {/* Vista Desktop (Simplificada) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-50 bg-slate-50/50 hover:bg-transparent">
              <TableHead className="w-[40px] pl-6 text-center"></TableHead>
              <TableHead className="text-xs font-black text-slate-500 uppercase tracking-widest">Cliente</TableHead>
              <TableHead className="text-xs font-black text-slate-500 uppercase tracking-widest">Dirección</TableHead>
              <TableHead className="text-center text-xs font-black text-slate-500 uppercase tracking-widest">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-black text-slate-500 uppercase tracking-widest">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((delivery) => {
              const isSelected = selectedIds.includes(delivery.id);
              return (
                <TableRow key={delivery.id} className={`group hover:bg-blue-50/20 border-b border-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                  <TableCell className="pl-6 py-4 text-center">
                    {(delivery.status === 'scheduled' || delivery.status === 'pending') && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(delivery.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="text-sm font-bold text-slate-900">{delivery.customer_name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{delivery.company_name}</p>
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="text-sm text-slate-600">{delivery.address}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{delivery.district_name}</p>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {getStatusBadge(delivery.status)}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDetail(delivery)}
                      className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Vista Mobile (Optimizada) */}
      <div className="md:hidden space-y-3">
        {sorted.map((delivery) => {
          const isFinished = ['delivered', 'cancelled', 'returned'].includes(delivery.status);
          const isSelected = selectedIds.includes(delivery.id);
          const canContact = delivery.status === 'in_transit' || delivery.status === 'delivered';

          // Extraemos la lógica compleja de clases para cumplir con SonarQube S3358
          let statusClasses = '';
          if (isFinished) {
            statusClasses = 'opacity-60 bg-gray-50/50';
          } else if (delivery.status === 'in_transit') {
            statusClasses = 'border-l-4 border-l-blue-500';
          }

          const selectionClasses = isSelected 
            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' 
            : 'border-gray-100 shadow-sm';

          return (
            <div
              key={delivery.id}
              className={`bg-white p-4 rounded-2xl border transition-all duration-300 relative ${selectionClasses} ${statusClasses}`}
            >
              <div className="flex justify-between items-start gap-3">
                <button 
                  type="button"
                  className="flex-1 text-left space-y-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" 
                  onClick={() => handleOpenDetail(delivery)}
                  aria-label={`Ver detalles de ${delivery.customer_name}`}
                >
                  <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-0.5">{delivery.company_name}</p>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{delivery.customer_name}</h3>
                  </div>

                  <div className="flex items-start gap-2">
                    <Navigation size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-slate-600 leading-tight">
                      {delivery.address} <span className="text-slate-300 mx-1">·</span> <span className="text-blue-600/70 font-black uppercase text-[10px] tracking-tight">{delivery.district_name}</span>
                    </p>
                  </div>
                </button>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  {getStatusBadge(delivery.status)}
                  {(delivery.status === 'scheduled' || delivery.status === 'pending') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(delivery.id);
                      }}
                      className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={isSelected ? 'Deseleccionar pedido' : 'Seleccionar pedido'}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white shadow-sm'}`}>
                        {isSelected && <CheckCircle2 size={16} />}
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {canContact && (
                <div className="pt-3 border-t border-gray-50 flex items-center gap-2">
                  <a
                    href={`tel:${delivery.phone.replaceAll(/\D/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all text-[10px] font-black tracking-widest uppercase focus:ring-2 focus:ring-slate-300"
                  >
                    <Phone size={14} /> Llamar
                  </a>
                  <a
                    href={`https://wa.me/51${delivery.phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent(getWhatsappMessage(delivery))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 active:scale-95 transition-all text-[10px] font-black tracking-widest uppercase border border-emerald-100 focus:ring-2 focus:ring-emerald-500"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="py-20 text-center space-y-2">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400">¡Todo despejado! No hay entregas pendientes.</p>
          </div>
        )}
      </div>

      {/* Barra de Acción Masiva (Premium Redesign) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white py-2 pl-4 pr-1.5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10 ring-1 ring-black/5">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-wider mb-0.5">Seleccionados</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tabular-nums leading-none">{selectedIds.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Pedidos</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSelectedIds([])}
                className="text-[10px] font-extrabold text-slate-400 hover:text-white transition-colors px-2 py-2"
                disabled={isUpdatingBulk}
              >
                Cancelar
              </button>
              <Button
                onClick={handleBulkStartRoute}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-[1.4rem] h-14 px-4 font-black text-[10px] shadow-[0_8px_20px_rgba(37,99,235,0.4)] flex items-center gap-2 active:scale-95 transition-all border border-blue-400/20"
                disabled={isUpdatingBulk}
              >
                {isUpdatingBulk ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Navigation size={14} className="fill-white/20 -rotate-12" />
                    <span className="tracking-wider uppercase">Iniciar Ruta</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeliveryDetailModal
        isOpen={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        delivery={selectedDelivery}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
