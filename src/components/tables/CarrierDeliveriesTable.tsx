'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, User } from 'lucide-react';
import DeliveryDetailModal from '@/components/forms/modals/DeliveryDetailModal';

interface Delivery {
  id: string;
  date: string;
  recipient: string;
  recipient_address: string;
  origin: string;
  destination: string;
  district: string;
  items_count: number;
  status: 'pending' | 'completed';
}

const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'TRK-9901-JP',
    date: '2024-02-06',
    recipient: 'Juan Pérez',
    recipient_address: 'Av. Larco 101, Miraflores',
    origin: 'Almacén Central Japi',
    destination: 'Av. Larco 101, Miraflores',
    district: 'Miraflores',
    items_count: 1,
    status: 'pending',
  },
  {
    id: 'TRK-9902-JP',
    date: '2024-02-06',
    recipient: 'Empresa ABC S.A.C.',
    recipient_address: 'Jr. Camaná 500, Lima',
    origin: 'Almacén Central Japi',
    destination: 'Jr. Camaná 500, Lima',
    district: 'Lima',
    items_count: 3,
    status: 'pending',
  },
  {
    id: 'TRK-9903-JP',
    date: '2024-02-06',
    recipient: 'Sofía Mendoza',
    recipient_address: 'Av. Benavides 1200, Surco',
    origin: 'Almacén Central Japi',
    destination: 'Av. Benavides 1200, Surco',
    district: 'Surco',
    items_count: 2,
    status: 'pending',
  },
  {
    id: 'TRK-9904-JP',
    date: '2024-02-06',
    recipient: 'Tech Park SAC',
    recipient_address: 'Calle Monte Bello 340, San Isidro',
    origin: 'Almacén Central Japi',
    destination: 'Calle Monte Bello 340, San Isidro',
    district: 'San Isidro',
    items_count: 5,
    status: 'pending',
  },
  {
    id: 'TRK-9905-JP',
    date: '2024-02-06',
    recipient: 'Luis Herrera',
    recipient_address: 'Jr. Ucayali 280, Lima',
    origin: 'Almacén Central Japi',
    destination: 'Jr. Ucayali 280, Lima',
    district: 'Lima',
    items_count: 1,
    status: 'pending',
  },
  {
    id: 'TRK-9906-JP',
    date: '2024-02-06',
    recipient: 'Distribuidora Sur',
    recipient_address: 'Av. Tomás Marsano 900, Surquillo',
    origin: 'Almacén Central Japi',
    destination: 'Av. Tomás Marsano 900, Surquillo',
    district: 'Surquillo',
    items_count: 4,
    status: 'pending',
  },
  {
    id: 'TRK-9907-JP',
    date: '2024-02-06',
    recipient: 'Ana Rojas',
    recipient_address: 'Ca. Los Ficus 67, La Molina',
    origin: 'Almacén Central Japi',
    destination: 'Ca. Los Ficus 67, La Molina',
    district: 'La Molina',
    items_count: 2,
    status: 'pending',
  },
  {
    id: 'TRK-9890-JP',
    date: '2024-02-05',
    recipient: 'María Lopez',
    recipient_address: 'Av. Salaverry 2020, Jesús María',
    origin: 'Almacén Central Japi',
    destination: 'Av. Salaverry 2020, Jesús María',
    district: 'Jesús María',
    items_count: 2,
    status: 'completed',
  },
  {
    id: 'TRK-9885-JP',
    date: '2024-02-04',
    recipient: 'Carlos Ruiz',
    recipient_address: 'Calle Los Pinos 123, San Isidro',
    origin: 'Almacén Central Japi',
    destination: 'Calle Los Pinos 123, San Isidro',
    district: 'San Isidro',
    items_count: 1,
    status: 'completed',
  },
  {
    id: 'TRK-9880-JP',
    date: '2024-02-04',
    recipient: 'Importex Peru',
    recipient_address: 'Av. Argentina 800, Callao',
    origin: 'Almacén Central Japi',
    destination: 'Av. Argentina 800, Callao',
    district: 'Callao',
    items_count: 6,
    status: 'completed',
  },
];

const STATUS_ORDER: Record<Delivery['status'], number> = { pending: 0, completed: 1 };

const getStatusBadge = (status: Delivery['status']) => {
  switch (status) {
    case 'completed': return <Badge variant="success">Entregado</Badge>;
    default: return <Badge variant="info">En Ruta</Badge>;
  }
};

export default function CarrierDeliveriesTable() {
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Derivar distritos únicos dinámicamente del array de datos
  // Solo mostrar distritos con al menos 1 entrega pendiente
  const districtsWithPending = Array.from(
    new Set(deliveries.filter(d => d.status === 'pending').map(d => d.district))
  ).sort();
  const districts = ['all', ...districtsWithPending];

  const sorted = [...deliveries]
    .filter(d => selectedDistrict === 'all' || d.district === selectedDistrict)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const handleOpenDetail = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const s = newStatus as Delivery['status'];
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: s } : d));
    if (selectedDelivery?.id === id) {
      setSelectedDelivery({ ...selectedDelivery, status: s });
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
              <TableHead className="w-[140px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking ID</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinatario</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  No hay entregas en <span className="font-medium text-gray-500">{selectedDistrict}</span>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((delivery) => (
                <TableRow
                  key={delivery.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  onClick={() => handleOpenDetail(delivery)}
                >
                  <TableCell className="pl-6 py-4 font-mono text-xs text-blue-700 font-medium h-16">
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
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 max-w-[280px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate" title={delivery.destination}>{delivery.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {getStatusBadge(delivery.status)}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
          sorted.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden active:scale-[0.99] transition-transform"
              onClick={() => handleOpenDetail(delivery)}
            >
              {/* Franja de estado izquierda */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${delivery.status === 'pending' ? 'bg-blue-500' : 'bg-emerald-500'}`} />

              <div className="pl-3">
                {/* Destinatario */}
                <p className="text-sm font-semibold text-gray-900 leading-tight truncate mb-1.5">{delivery.recipient}</p>

                {/* Distrito */}
                <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
                  <MapPin size={11} className="text-gray-400 shrink-0 mt-0.5" />
                  <span className="truncate">{delivery.district}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
