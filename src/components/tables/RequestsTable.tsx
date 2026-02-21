import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

export interface InboundRequest {
  id: number;
  request_date: string;
  total_skus: number;
  total_units: number;
  status: 'pending' | 'received' | 'rejected';
  pdf_url?: string;
}

interface RequestsTableProps {
  requests: InboundRequest[];
  onView: (request: InboundRequest) => void;
  onDownloadGuide: (request: InboundRequest) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'received':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-100';
    default: // pending
      return 'bg-amber-50 text-amber-700 border-amber-100';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'received': return 'Recibido';
    case 'rejected': return 'Rechazado';
    default: return 'Pendiente';
  }
};

export default function RequestsTable({
  requests,
  onView,
  onDownloadGuide
}: RequestsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Orden</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Creación</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
            <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ textAlign: 'center' }}>Guía</TableHead>
            <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((item) => (
            <TableRow
              key={item.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs text-gray-500 font-medium">
                #{item.id.toString().padStart(6, '0')}
              </TableCell>

              <TableCell className="py-4">
                <span className="text-sm font-medium text-gray-900">{item.request_date}</span>
              </TableCell>

              <TableCell className="py-4">
                <span className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  getStatusBadge(item.status)
                )}>
                  {getStatusLabel(item.status)}
                </span>
              </TableCell>

              <TableCell className="py-4 text-center">
                {item.pdf_url ? (
                  <Button
                    onClick={() => onDownloadGuide(item)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Descargar Guía de Remisión"
                  >
                    <FileText size={16} />
                  </Button>
                ) : (
                  <span className="text-xs text-gray-300">-</span>
                )}
              </TableCell>

              <TableCell className="text-right pr-6 py-4">
                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <FileText className="text-gray-300" size={24} />
                  </div>
                  <p>No has generado ninguna solicitud de ingreso.</p>
                  <p className="text-xs text-gray-400">Crea una nueva solicitud para enviar mercadería.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table >
    </div >
  );
}
