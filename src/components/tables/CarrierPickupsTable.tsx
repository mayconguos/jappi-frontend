import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, ArrowRight, Eye } from 'lucide-react';

interface Pickup {
  id: string;
  sender: string;
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
    status: 'pending',
    date: '2024-02-06',
    items_count: 3
  },
  {
    id: 'TRK-9823-JP',
    sender: 'Distribuidora Norte',
    origin: 'Av. Túpac Amaru 340, Independencia',
    destination: 'Ca. Colón 88, Jesús María',
    status: 'pending',
    date: '2024-02-06',
    items_count: 2
  },
  {
    id: 'TRK-9824-JP',
    sender: 'Electro Perú SAC',
    origin: 'Jr. Lampa 570, Cercado de Lima',
    destination: 'Av. Universitaria 1800, San Miguel',
    status: 'pending',
    date: '2024-02-06',
    items_count: 7
  },
  {
    id: 'TRK-9816-JP',
    sender: 'Confecciones Textil JP',
    origin: 'Jr. Gamarra 240, La Victoria',
    destination: 'Av. Primavera 1100, Surco',
    status: 'completed',
    date: '2024-02-04',
    items_count: 12
  },
  {
    id: 'TRK-9810-JP',
    sender: 'Insumos Industriales SA',
    origin: 'Av. Colonial 2400, Pueblo Libre',
    destination: 'Ca. Loreto 55, Barranco',
    status: 'completed',
    date: '2024-02-04',
    items_count: 3
  },
  {
    id: 'TRK-9825-JP',
    sender: 'Grupo Andino Logistic',
    origin: 'Av. Separadora Industrial 1200, Ate',
    destination: 'Ca. Los Álamos 45, La Molina',
    status: 'pending',
    date: '2024-02-06',
    items_count: 1
  },
  {
    id: 'TRK-9820-JP',
    sender: 'Importaciones Lima',
    origin: 'Av. Argentina 500, Callao',
    destination: 'Av. Brasil 300, Magdalena',
    status: 'completed',
    date: '2024-02-05',
    items_count: 4
  },
  {
    id: 'TRK-9818-JP',
    sender: 'Farmacéutica del Sur',
    origin: 'Av. Benavides 3200, Surco',
    destination: 'Av. Angamos 900, Miraflores',
    status: 'completed',
    date: '2024-02-05',
    items_count: 6
  },
  {
    id: 'TRK-9807-JP',
    sender: 'Agro Export Peru',
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
  const sortedPickups = [...MOCK_PICKUPS].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

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
            {sortedPickups.map((pickup) => (
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

      {/* Vista Móvil (Cards compactas) */}
      <div className="md:hidden space-y-2">
        {sortedPickups.map((pickup) => (
          <div key={pickup.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden active:scale-[0.99] transition-transform">
            {/* Franja de estado izquierda */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${pickup.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'}`} />

            <div className="pl-3">
              {/* Remitente */}
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate mb-1.5">{pickup.sender}</p>

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
    </>
  );
}
