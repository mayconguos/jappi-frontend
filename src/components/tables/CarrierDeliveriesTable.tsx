'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Package, ArrowRight, MapPin, User } from 'lucide-react';
import DeliveryDetailModal from '@/components/forms/modals/DeliveryDetailModal';

const INITIAL_DELIVERIES = [
  {
    id: 'TRK-9901-JP',
    date: '2024-02-06',
    recipient: 'Juan Pérez',
    recipient_address: 'Av. Larco 101, Miraflores',
    origin: 'Almacén Central Japi',
    destination: 'Av. Larco 101, Miraflores',
    items_count: 1,
    status: 'pending', // pending, in_progress, completed, failed
  },
  {
    id: 'TRK-9902-JP',
    date: '2024-02-06',
    recipient: 'Empresa ABC S.A.C.',
    recipient_address: 'Jr. Camana 500, Lima',
    origin: 'Almacén Central Japi',
    destination: 'Jr. Camana 500, Lima',
    items_count: 3,
    status: 'in_progress',
  },
  {
    id: 'TRK-9890-JP',
    date: '2024-02-05',
    recipient: 'María Lopez',
    recipient_address: 'Av. Salaverry 2020, Jesus Maria',
    origin: 'Almacén Central Japi',
    destination: 'Av. Salaverry 2020, Jesus Maria',
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
    items_count: 1,
    status: 'failed',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Entregado</Badge>;
    case 'in_progress':
      return <Badge variant="info">En Ruta</Badge>;
    case 'failed':
      return <Badge variant="destructive">Fallido</Badge>;
    default:
      return <Badge variant="warning">Pendiente</Badge>;
  }
};

export default function CarrierDeliveriesTable() {
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (delivery: any) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setDeliveries(prev => prev.map(d =>
      d.id === id ? { ...d, status: newStatus } : d
    ));
    // Update selected delivery as well so modal reflects change immediately
    if (selectedDelivery && selectedDelivery.id === id) {
      setSelectedDelivery({ ...selectedDelivery, status: newStatus });
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="w-[180px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Envío</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinatario</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="w-[100px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow
                key={delivery.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => handleOpenDetail(delivery)}
              >
                {/* Envío: Tracking */}
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-medium text-blue-700">
                      {delivery.id}
                    </span>
                  </div>
                </TableCell>

                {/* Destinatario: Avatar + Nombre + Dirección */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 min-w-[2.25rem] rounded-full flex items-center justify-center bg-blue-50 text-blue-600 ring-1 ring-blue-100/50 text-xs font-medium">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-900 line-clamp-1" title={delivery.recipient}>
                        {delivery.recipient}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin size={12} />
                        <span className="text-xs truncate max-w-[300px]" title={delivery.recipient_address}>
                          {delivery.recipient_address}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell className="py-4 text-center">
                  {getStatusBadge(delivery.status)}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-normal"
                      title="Ver Detalles"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(delivery);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden active:scale-[0.99] transition-transform"
            onClick={() => handleOpenDetail(delivery)}
          >
            {/* Status Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${delivery.status === 'pending' ? 'bg-yellow-400' :
              delivery.status === 'in_progress' ? 'bg-blue-500' :
                delivery.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />

            <div className="pl-3 pr-1 pt-1">
              {/* Header: Tracking | Packages | Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-gray-500 mb-0.5">
                    <span className="text-xs font-mono font-medium">{delivery.id}</span>
                    <span className="text-[10px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-semibold">{delivery.items_count} pqt</span>
                  </div>
                  <div className="font-bold text-lg text-gray-900 leading-tight">{delivery.recipient}</div>
                </div>
                <div className="scale-90 origin-top-right shrink-0 ml-2">
                  {getStatusBadge(delivery.status)}
                </div>
              </div>

              {/* Address Block - Compact */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-1">
                <MapPin className="text-blue-500 shrink-0" size={18} />
                <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{delivery.destination}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <DeliveryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        delivery={selectedDelivery}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
