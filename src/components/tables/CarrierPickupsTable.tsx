'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, ArrowRight, Eye, MessageCircle, Phone, Map, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import PickupDetailModal from '@/components/forms/modals/PickupDetailModal';
import { Pagination } from '@/components/ui/pagination';

interface Pickup {
  id: string;
  sender: string;
  sender_phone: string;
  origin: string;
  destination: string;
  district: string;
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
    district: 'San Isidro',
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
    district: 'Miraflores',
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
    district: 'Independencia',
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
    district: 'Lima',
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
    district: 'La Victoria',
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
    district: 'Pueblo Libre',
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
    district: 'Ate',
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
    district: 'Callao',
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
    district: 'Surco',
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
    district: 'San Miguel',
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
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Derivar distritos únicos
  const districtsWithPending = Array.from(
    new Set(pickups.filter(p => p.status === 'pending').map(p => p.district))
  ).sort();
  const districts = ['all', ...districtsWithPending];

  const filtered = pickups.filter(p => selectedDistrict === 'all' || p.district === selectedDistrict);

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

  const sortedPickups = [...filtered].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDistrict]);

  const totalItems = sortedPickups.length;
  const currentItems = sortedPickups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      {/* Filtro por Distrito (Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none mb-4">
        {districts.map((district) => {
          const isActive = selectedDistrict === district;
          const count = district === 'all'
            ? pickups.length
            : pickups.filter(p => p.district === district).length;
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
              <TableHead className="w-[140px] text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking ID</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remitente</TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Fecha</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Paquetes</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruta (Origen - Destino)</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((pickup, index) => (
              <TableRow
                key={pickup.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => handleOpenDetail(pickup)}
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </TableCell>
                <TableCell className="py-4 font-mono text-xs text-emerald-700 font-medium h-16">
                  {pickup.id}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[180px]" title={pickup.sender}>
                    {pickup.sender}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                    {pickup.date}
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
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pickup.origin}, ${pickup.district}, Lima`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                      title="Cómo llegar"
                    >
                      <Map size={16} />
                    </a>
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
                <div className="flex gap-1.5">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pickup.origin}, ${pickup.district}, Lima`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-7 px-2 items-center justify-center gap-1 rounded-full bg-emerald-100 text-emerald-700 shadow-sm active:scale-90 transition-transform text-[10px] font-bold border border-emerald-200"
                  >
                    <Navigation size={12} className="fill-emerald-700/10" />
                    MAPS
                  </a>
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

              {/* Dirección de Origen */}
              <div className="flex items-start gap-1.5 text-[11px] text-gray-600 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                <span className="line-clamp-1 italic">{pickup.origin}</span>
              </div>

              {/* Distrito */}
              <div className="flex items-start gap-1.5 text-[10px] text-gray-400 font-medium">
                <MapPin size={10} className="text-gray-400 shrink-0 mt-0.5" />
                <span className="truncate uppercase tracking-tight">{pickup.district}</span>
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
