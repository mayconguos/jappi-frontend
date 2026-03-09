import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Package, User } from 'lucide-react';

export const MOVEMENT_MAPPING: Record<string, { label: string; baseType: 'IN' | 'OUT' | 'ADJUSTMENT' }> = {
  // Entradas
  return_from_customer: { label: 'Devol. de Cliente', baseType: 'IN' },
  pickup: { label: 'Recojo', baseType: 'IN' },
  supply_request: { label: 'Abastecimiento', baseType: 'IN' },
  adjustment_in: { label: 'Ajuste Entrada', baseType: 'ADJUSTMENT' },
  initial_stock: { label: 'Stock Inicial', baseType: 'IN' },

  // Salidas
  return_to_supplier: { label: 'Devol. a Proveedor', baseType: 'OUT' },
  shipping: { label: 'Despacho', baseType: 'OUT' },
  adjustment_out: { label: 'Ajuste Salida', baseType: 'ADJUSTMENT' },
};

export interface KardexMovement {
  id: number;
  id_product: number;
  company_name: string;
  product_name: string;
  movement_type: string;
  quantity: number;
  movement_date: string;
  balance: number;
  created_by?: string;
}

interface KardexTableProps {
  movements: KardexMovement[];
  currentPage: number;
}

export default function KardexTable({ movements, currentPage }: KardexTableProps) {

  const getMovementIcon = (baseType: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    switch (baseType) {
      case 'IN': return <ArrowDownRight size={14} className="text-emerald-600" />;
      case 'OUT': return <ArrowUpRight size={14} className="text-red-600" />;
      case 'ADJUSTMENT': return <RefreshCw size={14} className="text-blue-600" />;
    }
  };

  const getMovementColor = (baseType: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    switch (baseType) {
      case 'IN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OUT': return 'bg-red-50 text-red-700 border-red-200';
      case 'ADJUSTMENT': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 bg-gray-50/50">
            <TableHead className="w-[140px] pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha / Hora</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</TableHead>
            <TableHead className="text-center w-[160px] text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo Mov. / Origen</TableHead>
            <TableHead className="text-right w-[100px] text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</TableHead>
            <TableHead className="text-right w-[120px] text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Final</TableHead>
            <TableHead className="text-right pr-6 w-[160px] text-xs font-bold text-gray-500 uppercase tracking-wider">Realizado por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((mov) => {
            const config = MOVEMENT_MAPPING[mov.movement_type] || { label: mov.movement_type, baseType: 'ADJUSTMENT' };
            const isInput = config.baseType === 'IN';

            // Format dates
            let formattedDate = 'Sin fecha';
            let formattedTime = '';
            try {
              if (mov.movement_date) {
                const dateObj = new Date(mov.movement_date);
                formattedDate = dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
                formattedTime = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
              }
            } catch (e) { }

            return (
              <TableRow
                key={mov.id}
                className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors group"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">{formattedDate}</span>
                    <span className="text-xs text-gray-400">{formattedTime}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-1" title={mov.product_name}>
                      {mov.product_name}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <Badge variant="outline" className={`gap-1.5 justify-center w-[140px] ${getMovementColor(config.baseType)}`}>
                    {getMovementIcon(config.baseType)}
                    <span className="truncate">{config.label}</span>
                  </Badge>
                </TableCell>

                <TableCell className="py-4 text-right">
                  <span className={`text-sm font-bold font-mono tracking-tight ${isInput ? 'text-emerald-600' : config.baseType === 'OUT' ? 'text-red-600' : 'text-blue-600'}`}>
                    {isInput ? '+' : config.baseType === 'OUT' ? '-' : ''}{mov.quantity}
                  </span>
                </TableCell>

                <TableCell className="py-4 text-right">
                  <span className="text-sm font-bold font-mono text-gray-900 bg-gray-100 px-2.5 py-1 rounded">
                    {mov.balance}
                  </span>
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-2 text-gray-600">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm font-medium leading-snug truncate max-w-[120px]" title={mov.created_by || 'Sistema / API'}>
                      {mov.created_by || 'Sistema / API'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          {movements.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={32} className="text-gray-300" />
                  <p className="text-sm">No se encontraron movimientos registrados</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
