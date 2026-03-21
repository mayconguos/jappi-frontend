'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, ArrowRight, Eye, MessageCircle, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import PickupDetailModal from '@/components/forms/modals/PickupDetailModal';
import { Pagination } from '@/components/ui/pagination';

interface Pickup {
  id: string;
  sender: string;
  sender_phone: string;
  origin: string;
  destination: string;
  status: 'pending' | 'completed';
  date: string;
  items_count: number;
}

const MOCK_PICKUPS: Pickup[] = [
  {
    id: 'TRK-9821-JP',
    sender: 'Tech Solutions SAC',
    sender_phone: '+51 976 548 966',
    origin: 'Av. Javier Prado 123, San Isidro',
    destination: 'Jr. Unión 456, Lima',
    status: 'pending',
    date: '2024-02-06',
    items_count: 5
  },
  {
    id: 'TRK-9822-JP',
    sender: 'Moda Express',
    sender_phone: '+51 976 548 966',
    origin: 'Ca. Los Pinos 789, Miraflores',
    destination: 'Av. Arequipa 1020, Lince',
    status: 'pending',
    date: '2024-02-06',
    items_count: 3
  },
  {
    id: 'TRK-9823-JP',
    sender: 'Distribuidora Norte',
    sender_phone: '+51 976 548 966',
    origin: 'Av. Túpac Amaru 340, Independencia',
    destination: 'Ca. Colón 88, Jesús María',
    status: 'pending',
    date: '2024-02-06',
    items_count: 2
  },
  {
    id: 'TRK-9824-JP',
    sender: 'Electro Perú SAC',
    sender_phone: '+51 976 548 966',
    origin: 'Jr. Lampa 570, Cercado de Lima',
    destination: 'Av. Universitaria 1800, San Miguel',
    status: 'pending',
    date: '2024-02-06',
    items_count: 7
  },
  {
    id: 'TRK-9816-JP',
    sender: 'Confecciones Textil JP',
    sender_phone: '+51 976 548 966',
    origin: 'Jr. Gamarra 240, La Victoria',
    destination: 'Av. Primavera 1100, Surco',
    status: 'completed',
    date: '2024-02-04',
    items_count: 12
  },
  {
    id: 'TRK-9810-JP',
    sender: 'Insumos Industriales SA',
    sender_phone: '+51 976 548 966',
    origin: 'Av. Colonial 2400, Pueblo Libre',
    destination: 'Ca. Loreto 55, Barranco',
    status: 'completed',
    date: '2024-02-04',
    items_count: 3
  },
  {
    id: 'TRK-9825-JP',
    sender: 'Grupo Andino Logistic',
    sender_phone: '+51 976 548 966',
    origin: 'Av. Separadora Industrial 1200, Ate',
    destination: 'Ca. Los Álamos 45, La Molina',
    status: 'pending',
    date: '2024-02-06',
    items_count: 1
  },
  {
    id: 'TRK-9820-JP',
    sender: 'Importaciones Lima',
    sender_phone: '+51 976 548 966',
    origin: 'Av. Argentina 500, Callao',
    destination: 'Av. Brasil 300, Magdalena',
    status: 'completed',
    date: '2024-02-05',
    items_count: 4
  },
  {
    id: 'TRK-9818-JP',
    sender: 'Farmacéutica del Sur',
    sender_phone: '+51 976 548 966',
    origin: 'Av. Benavides 3200, Surco',
    destination: 'Av. Angamos 900, Miraflores',
    status: 'completed',
    date: '2024-02-05',
    items_count: 6
  },
  {
    id: 'TRK-9807-JP',
    sender: 'Agro Export Peru',
    sender_phone: '+51 976 548 966',
    origin: 'Av. La Marina 2000, San Miguel',
    destination: 'Jr. Ica 320, Cercado de Lima',
    status: 'completed',
    date: '2024-02-03',
    items_count: 8
  }
];

const getStatusBadge = (status: Pickup['status']) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Por recoger</Badge>;
    case 'completed':
      return <Badge variant="success">Entregado</Badge>;
    default:
      return <Badge variant="outline">Desconocido</Badge>;
  }
};

const STATUS_ORDER: Record<Pickup['status'], number> = { pending: 0, completed: 1 };

export default function CarrierPickupsTable() {
  const [pickups, setPickups] = useState<Pickup[]>(MOCK_PICKUPS);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const s = newStatus as Pickup['status'];
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status: s } : p));
    if (selectedPickup?.id === id) {
      setSelectedPickup({ ...selectedPickup, status: s });
    }
  };

  const sortedPickups = [...pickups].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = sortedPickups.length;
  const currentItems = sortedPickups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="w-[140px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking ID</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remitente</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Paquetes</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruta (Origen - Destino)</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((pickup) => (
              <TableRow
                key={pickup.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => handleOpenDetail(pickup)}
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-emerald-700 font-medium h-16">
                  {pickup.id}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[180px]" title={pickup.sender}>
                    {pickup.sender}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${pickup.sender_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${pickup.sender}, te saluda el motorizado de Jappi Express. Estoy en camino para recoger tu pedido ${pickup.id} en ${pickup.origin}.`)}`}
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
                      href={`tel:${pickup.sender_phone.replace(/\D/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-100"
                      title="Llamar"
                    >
                      <Phone size={14} className="fill-blue-700/10" />
                      Llamar
                    </a>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                    <Package size={12} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">{pickup.items_count}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1.5 max-w-[280px]">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                      <span className="truncate" title={pickup.origin}>{pickup.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate" title={pickup.destination}>{pickup.destination}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  {getStatusBadge(pickup.status)}
                </TableCell>
                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end transition-opacity">
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 gap-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-normal"
                      onClick={(e) => { e.stopPropagation(); handleOpenDetail(pickup); }}
                    >
                      <Eye size={16} />
                      <span className="text-xs">Ver</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil (Cards compactas) */}
      <div className="md:hidden space-y-2">
        {currentItems.map((pickup) => (
          <div
            key={pickup.id}
            className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden active:scale-[0.99] transition-transform"
            onClick={() => handleOpenDetail(pickup)}
          >
            {/* Franja de estado izquierda */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${pickup.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'}`} />

            <div className="pl-3">
              {/* Remitente */}
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{pickup.sender}</p>
                <div className="flex gap-2">
                  <a
                    href={`tel:${pickup.sender_phone.replace(/\D/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm active:scale-90 transition-transform"
                  >
                    <Phone size={14} />
                  </a>
                  <a
                    href={`https://wa.me/${pickup.sender_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${pickup.sender}, te saluda el motorizado de Jappi Express. Estoy en camino a recoger tu pedido ${pickup.id}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm active:scale-90 transition-transform"
                  >
                    <MessageCircle size={14} />
                  </a>
                </div>
              </div>

              {/* Ruta inline: Origen → Destino */}
              <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
                <MapPin size={11} className="text-gray-400 shrink-0 mt-0.5" />
                <span className="truncate">{pickup.origin}</span>
                <ArrowRight size={11} className="text-gray-300 shrink-0 mt-0.5" />
                <span className="truncate">{pickup.destination}</span>
              </div>
            </div>
          </div>
        ))}
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

      {/* Modal de Detalle de Recojo */}
      <PickupDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pickup={selectedPickup}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
