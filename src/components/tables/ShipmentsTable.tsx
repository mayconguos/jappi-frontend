import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Shipment {
  id: number;
  company_name: string;
  shipping_date: string;
  customer_name: string;
  product_name: string;
  shipping_mode: 'delivery_only' | 'pay_on_delivery';
  observation: string;
  status: string;
  total_amount: number;
  delivery_amount: number;
  phone: string;
  address: string;
}

interface ShipmentsTableProps {
  shipments: Shipment[];
  currentPage: number;
  itemsPerPage: number;
  onView: (shipment: Shipment) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-amber-50 text-amber-700 border-amber-100',
  'scheduled': 'bg-blue-50 text-blue-700 border-blue-100',
  'picked_up': 'bg-purple-50 text-purple-700 border-purple-100',
  'received': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'in_transit': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'cancelled': 'bg-red-50 text-red-700 border-red-100',
  'returned': 'bg-orange-50 text-orange-700 border-orange-100',
};

const STATUS_LABELS: Record<string, string> = {
  'pending': 'Pendiente',
  'scheduled': 'Programado',
  'picked_up': 'Recogido',
  'received': 'Recibido',
  'in_transit': 'En tránsito',
  'delivered': 'Entregado',
  'cancelled': 'Cancelado',
  'returned': 'Devuelto',
};

const SHIPPING_MODE_LABELS: Record<string, string> = {
  'delivery_only': 'Solo Entrega',
  'pay_on_delivery': 'Contra Entrega',
};

export default function ShipmentsTable({
  shipments,
  currentPage,
  itemsPerPage,
  onView,
}: ShipmentsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente / Destino</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modo</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</TableHead>
            <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalles</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((item, index) => (
            <TableRow
              key={item.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell className="pl-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900">{item.customer_name}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[200px]" title={item.address}>{item.address}</span>
                </div>
              </TableCell>

              <TableCell className="py-4 max-w-[200px]">
                <p className="text-sm text-gray-600 truncate" title={item.product_name}>
                  {item.product_name}
                </p>
              </TableCell>

              <TableCell className="py-4 whitespace-nowrap">
                <span className="text-sm text-gray-700 font-medium">{new Date(item.shipping_date).toLocaleDateString('es-PE')}</span>
              </TableCell>

              <TableCell className="py-4">
                <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded bg-slate-100 ${item.shipping_mode === 'pay_on_delivery' ? 'text-blue-600 border border-blue-100 bg-blue-50/50' : 'text-slate-500'}`}>
                  {SHIPPING_MODE_LABELS[item.shipping_mode] || item.shipping_mode}
                </span>
              </TableCell>

              <TableCell className="py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {STATUS_LABELS[item.status] || item.status}
                </span>
              </TableCell>

              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-emerald-600">S/ {Number(item.total_amount).toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400">Delivery: S/ {Number(item.delivery_amount).toFixed(2)}</span>
                </div>
              </TableCell>

              <TableCell className="text-right pr-6 py-4">
                <div className="flex items-center justify-end transition-opacity">
                  <Button
                    onClick={() => onView(item)}
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-normal"
                  >
                    <Eye size={16} />
                    <span className="text-xs">Ver</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {shipments.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-300 text-6xl">📦</span>
                  <p className="text-sm font-medium">No hay envíos registrados.</p>
                  <p className="text-xs text-gray-400">Tus envíos aparecerán aquí una vez que los registres.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

