import { Eye, FileText, Download, MessageSquareWarning } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { clsx } from 'clsx';

export interface InboundRequest {
  id: number;
  request_date: string;
  total_skus: number;
  total_units: number;
  status: 'pending' | 'received' | 'rejected';
  observation?: string;
  pdf_url?: string;
  company_name?: string;
}

interface RequestsTableProps {
  requests: InboundRequest[];
  currentPage: number;
  itemsPerPage: number;
  onView: (request: InboundRequest) => void;
  onDownloadGuide: (request: InboundRequest) => void;
  isWarehouse?: boolean;
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
  currentPage,
  itemsPerPage = 10,
  onView,
  onDownloadGuide,
  isWarehouse = false,
}: Readonly<RequestsTableProps>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-2 py-3 text-center w-8">#</th>
              <th className="px-4 py-3">ID Orden</th>
              <th className="px-4 py-3">Fecha Creación</th>
              {isWarehouse && (
                <th className="px-4 py-3">Empresa</th>
              )}
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Guía</th>
              <th className="px-4 py-3 text-right pr-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-2 py-3 whitespace-nowrap text-center font-mono text-[11px] font-bold text-slate-300">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 font-medium whitespace-nowrap">
                  #{item.id.toString().padStart(6, '0')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-slate-900">{item.request_date}</span>
                </td>

                {isWarehouse && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{item.company_name ?? <span className="text-slate-300 text-xs">—</span>}</span>
                  </td>
                )}

                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                      getStatusBadge(item.status)
                    )}>
                      {getStatusLabel(item.status)}
                    </span>
                    {/* Icono de observación: sólo si hay observation y fue recibido */}
                    {item.status === 'received' && item.observation && (
                      <span
                        title={item.observation}
                        className="inline-flex items-center text-amber-500 cursor-help"
                      >
                        <MessageSquareWarning size={15} />
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {item.pdf_url ? (
                    <Button
                      onClick={() => onDownloadGuide(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg hover:shadow-md hover:shadow-indigo-100 transition-all"
                      title="Descargar Guía de Remisión"
                    >
                      <FileText size={16} />
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-300">-</span>
                  )}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-right pr-6">
                  <div className="flex items-center justify-end opacity-40 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <Button
                      onClick={() => onView(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg hover:shadow-md hover:shadow-emerald-100 transition-all"
                      title="Ver Detalles"
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No hay solicitudes</h3>
                    <p className="text-slate-500">No se encontraron solicitudes con los filtros actuales.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
