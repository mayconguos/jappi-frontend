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
              <TableHead className="w-[140px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking ID</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remitente</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Paquetes</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruta (Origen - Destino)</TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PICKUPS.map((pickup) => (
              <TableRow key={pickup.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                <TableCell className="pl-6 py-4 font-mono text-xs text-emerald-700 font-medium h-16">
                  {pickup.id}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[180px]" title={pickup.sender}>
                    {pickup.sender}
                  </span>
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
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-normal">
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

      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {MOCK_PICKUPS.map((pickup) => (
          <div key={pickup.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden active:scale-[0.99] transition-transform">
            {/* Status Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${pickup.status === 'pending' ? 'bg-yellow-400' :
              pickup.status === 'in_progress' ? 'bg-blue-500' :
                pickup.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />

            <div className="pl-3 pr-1 pt-1">
              {/* Header: Tracking | Packages | Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-gray-500 mb-0.5">
                    <span className="text-xs font-mono font-medium">{pickup.id}</span>
                    <span className="text-[10px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-semibold">{pickup.items_count} pqt</span>
                  </div>
                  <div className="font-bold text-lg text-gray-900 leading-tight">{pickup.sender}</div>
                </div>
                <div className="scale-90 origin-top-right shrink-0 ml-2">
                  {getStatusBadge(pickup.status)}
                </div>
              </div>

              {/* Origin/Pickup Address Block - Compact */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-1">
                <MapPin className="text-emerald-500 shrink-0" size={18} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Recoger en</p>
                  <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{pickup.origin}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
