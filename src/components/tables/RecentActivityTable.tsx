import { ArrowDownLeft, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { InboundRequest } from '@/context/InventoryContext';

interface RecentActivityTableProps {
  requests: InboundRequest[];
}

export default function RecentActivityTable({ requests }: RecentActivityTableProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Movimientos Recientes</h3>
        <Link href="/dashboard/inventory/requests" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          Ver todo <ChevronRight size={14} />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.slice(0, 5).map((req) => (
              <TableRow
                key={req.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-500 font-medium">
                  #{req.id}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <ArrowDownLeft size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Entrada</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm text-gray-600">
                  {req.request_date}
                </TableCell>
                <TableCell className="py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${req.status === 'received' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {req.status === 'received' ? 'Recibido' : req.status === 'pending' ? 'Pendiente' : req.status}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6 py-4">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600">
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No hay movimientos recientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
