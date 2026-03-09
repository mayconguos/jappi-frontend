import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowUpRight, ArrowDownRight, RefreshCw, Package } from 'lucide-react';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface KardexMovement {
  id: string;
  date: string;
  time: string;
  product_sku: string;
  product_name: string;
  movement_type: MovementType;
  quantity: number;
  balance: number;
  reference_document: string;
  user: string;
}

interface KardexTableProps {
  movements: KardexMovement[];
  currentPage: number;
  onViewDetail: (movement: KardexMovement) => void;
}

export default function KardexTable({ movements, currentPage, onViewDetail }: KardexTableProps) {
  
  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case 'IN': return <ArrowDownRight size={14} className="text-emerald-600" />;
      case 'OUT': return <ArrowUpRight size={14} className="text-red-600" />;
      case 'ADJUSTMENT': return <RefreshCw size={14} className="text-blue-600" />;
    }
  };

  const getMovementColor = (type: MovementType) => {
    switch (type) {
      case 'IN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OUT': return 'bg-red-50 text-red-700 border-red-200';
      case 'ADJUSTMENT': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getMovementLabel = (type: MovementType) => {
    switch (type) {
      case 'IN': return 'Entrada';
      case 'OUT': return 'Salida';
      case 'ADJUSTMENT': return 'Ajuste';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 bg-gray-50/50">
            <TableHead className="w-[140px] pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha / Hora</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Producto (SKU)</TableHead>
            <TableHead className="w-[120px] text-xs font-bold text-gray-500 uppercase tracking-wider">Detalle mov.</TableHead>
            <TableHead className="text-center w-[120px] text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</TableHead>
            <TableHead className="text-right w-[100px] text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</TableHead>
            <TableHead className="text-right w-[120px] text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Final</TableHead>
            <TableHead className="text-right pr-6 w-[80px] text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((mov) => {
            const isInput = mov.movement_type === 'IN';
            return (
              <TableRow
                key={mov.id}
                className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors group"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">{mov.date}</span>
                    <span className="text-xs text-gray-400">{mov.time}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 border border-gray-200">
                      <Package size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-1" title={mov.product_name}>
                        {mov.product_name}
                      </p>
                      <p className="text-xs font-mono text-gray-500">SKU: {mov.product_sku}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                   <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded w-max mb-1">
                        {mov.reference_document}
                      </span>
                      <span className="text-[11px] text-gray-400 truncate max-w-[150px]" title={`Usuario: ${mov.user}`}>
                        User: {mov.user}
                      </span>
                   </div>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <Badge variant="outline" className={`gap-1.5 justify-center w-[90px] ${getMovementColor(mov.movement_type)}`}>
                    {getMovementIcon(mov.movement_type)}
                    {getMovementLabel(mov.movement_type)}
                  </Badge>
                </TableCell>

                <TableCell className="py-4 text-right">
                  <span className={`text-sm font-bold font-mono tracking-tight ${isInput ? 'text-emerald-600' : mov.movement_type === 'OUT' ? 'text-red-600' : 'text-blue-600'}`}>
                    {isInput ? '+' : mov.movement_type === 'OUT' ? '-' : ''}{mov.quantity}
                  </span>
                </TableCell>

                <TableCell className="py-4 text-right">
                   <span className="text-sm font-bold font-mono text-gray-900 bg-gray-100 px-2.5 py-1 rounded">
                     {mov.balance}
                   </span>
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <div className="flex justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onViewDetail(mov)}
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Ver Detalle"
                    >
                      <Eye size={16} />
                    </Button>
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
