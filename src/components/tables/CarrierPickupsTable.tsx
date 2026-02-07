import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, ArrowRight, Eye } from 'lucide-react';

interface Pickup {
  id: string;
  sender: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  items_count: number;
}

const MOCK_PICKUPS: Pickup[] = [
  {
    id: 'TRK-9821-JP',
    sender: 'Tech Solutions SAC',
    origin: 'Av. Javier Prado 123, San Isidro',
    destination: 'Jr. Unión 456, Lima',
    status: 'pending',
    date: '2024-02-06',
    items_count: 5
  },
  {
    id: 'TRK-9822-JP',
    sender: 'Moda Express',
    origin: 'Ca. Los Pinos 789, Miraflores',
    destination: 'Av. Arequipa 1020, Lince',
    status: 'in_progress',
    date: '2024-02-06',
    items_count: 12
  },
  {
    id: 'TRK-9820-JP',
    sender: 'Importaciones Lima',
    origin: 'Av. Argentina 500, Callao',
    destination: 'Av. Brasil 300, Magdalena',
    status: 'completed',
    date: '2024-02-05',
    items_count: 50
  }
];

const getStatusBadge = (status: Pickup['status']) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Pendiente de Recojo</Badge>;
    case 'in_progress':
      return <Badge variant="info">En Ruta</Badge>;
    case 'completed':
      return <Badge variant="success">Entregado</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelado</Badge>;
    default:
      return <Badge variant="outline">Desconocido</Badge>;
  }
};

export default function CarrierPickupsTable() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="w-[180px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Envío</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruta</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="w-[100px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PICKUPS.map((pickup) => (
              <TableRow key={pickup.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                {/* Envío: Tracking + Fecha */}
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-medium text-emerald-700">
                      {pickup.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {pickup.date}
                    </span>
                  </div>
                </TableCell>

                {/* Cliente: Avatar + Nombre + Paquetes */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 min-w-[2.25rem] rounded-full flex items-center justify-center bg-gray-100 text-gray-500 ring-1 ring-gray-100/50 text-xs font-medium">
                      {pickup.sender.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-900 line-clamp-1" title={pickup.sender}>
                        {pickup.sender}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Package size={12} />
                        <span className="text-xs">{pickup.items_count} paquetes</span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Ruta */}
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1.5 max-w-[280px]">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate" title={pickup.origin}>{pickup.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="truncate" title={pickup.destination}>{pickup.destination}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell className="py-4 text-center">
                  {getStatusBadge(pickup.status)}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-normal"
                      title="Ver Detalles"
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
        {MOCK_PICKUPS.map((pickup) => (
          <div key={pickup.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            {/* Status Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${pickup.status === 'pending' ? 'bg-yellow-400' :
              pickup.status === 'in_progress' ? 'bg-blue-500' :
                pickup.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />

            <div className="flex justify-between items-start mb-4 pl-2">
              <div>
                <span className="text-xs font-mono text-gray-400 block mb-0.5">{pickup.date}</span>
                <div className="font-bold text-lg text-gray-900 tracking-tight">{pickup.id}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">{pickup.sender}</div>
              </div>
              <div className="scale-90 origin-top-right">
                {getStatusBadge(pickup.status)}
              </div>
            </div>

            {/* Visual Route Timeline */}
            <div className="relative pl-6 space-y-6 border-l-2 border-dashed border-gray-100 ml-3 mb-5">
              <div className="relative">
                <div className="absolute -left-[23px] top-1.5 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full shadow-sm"></div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Recojo</p>
                <p className="text-sm font-medium text-gray-900 leading-snug">{pickup.origin}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1.5 w-3 h-3 bg-white border-2 border-red-400 rounded-full shadow-sm"></div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Entrega</p>
                <p className="text-sm font-medium text-gray-900 leading-snug">{pickup.destination}</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 pl-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Package size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">{pickup.items_count}</span> paquetes
              </div>
              <Button size="sm" className="bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200">
                Ver Detalles <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
