import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Mail, Phone, Building2 } from 'lucide-react';

export interface UnverifiedCompany {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  company_name: string;
  phone_number: string;
  is_corporate: boolean;
}

interface PendingTableProps {
  companies: UnverifiedCompany[];
  currentPage: number;
  itemsPerPage: number;
  onActivate: (company: UnverifiedCompany) => void;
  onReject: (company: UnverifiedCompany) => void;
}

export default function PendingTable({
  companies,
  currentPage,
  itemsPerPage,
  onActivate,
  onReject,
}: PendingTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Vista Desktop (Tabla) ── */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Representante</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</TableHead>
              <TableHead className="w-[180px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((item, index) => (
              <TableRow
                key={item.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 min-w-[2.5rem] rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase ring-1 ring-indigo-100/50">
                      {item.company_name.substring(0, 2)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-900">{item.company_name}</span>
                      <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        Pendiente
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">{item.first_name} {item.last_name}</span>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Mail size={12} />
                      <span className="text-xs">{item.email}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-md font-mono">{item.phone_number}</span>
                  </div>
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => onReject(item)}
                      variant="secondary"
                      className="h-8 px-3 text-[11px] font-semibold text-gray-500 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-all rounded-full"
                      title="Rechazar solicitud"
                    >
                      Rechazar
                    </Button>
                    <Button
                      onClick={() => onActivate(item)}
                      className="h-8 px-4 text-[11px] font-bold bg-[#02997d] hover:bg-[#028870] text-white shadow-sm shadow-[#02997d]/20 transition-all rounded-full"
                      title="Aprobar la cuenta"
                    >
                      Aprobar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No hay solicitudes pendientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Vista Mobile (Tarjetas) ── */}
      <div className="block md:hidden divide-y divide-gray-100">
        {companies.length > 0 ? (
          companies.map((item, index) => (
            <div key={item.id} className="p-4 space-y-4 bg-white hover:bg-gray-50/50 transition-colors">

              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 min-w-[2.5rem] rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase ring-1 ring-indigo-100/50">
                    {item.company_name.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">{item.company_name}</span>
                    <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100 mt-1">
                      Pendiente
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-mono whitespace-nowrap">#{((currentPage - 1) * itemsPerPage) + index + 1}</span>
              </div>

              {/* Card Body: Info */}
              <div className="grid grid-cols-1 gap-3 text-sm bg-gray-50/80 p-3.5 rounded-xl border border-gray-100/60">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Representante</span>
                  <span className="font-medium text-gray-900 text-sm">{item.first_name} {item.last_name}</span>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                    <Mail size={12} className="shrink-0" />
                    <span className="text-xs truncate">{item.email}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200/60">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Contacto</span>
                  <div className="flex items-center gap-1.5 text-gray-900">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span className="font-mono text-sm">{item.phone_number}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Buttons */}
              <div className="pt-1 flex items-center gap-3 w-full">
                <Button
                  onClick={() => onReject(item)}
                  variant="secondary"
                  className="flex-1 h-10 px-3 text-[13px] font-semibold text-gray-600 border-gray-200 bg-white shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-all rounded-lg"
                >
                  <X size={16} className="mr-1.5" />
                  Rechazar
                </Button>
                <Button
                  onClick={() => onActivate(item)}
                  className="flex-1 h-10 px-3 text-[13px] font-bold bg-[#02997d] hover:bg-[#028870] text-white shadow-sm shadow-[#02997d]/20 transition-all rounded-lg"
                >
                  <Check size={16} className="mr-1.5" />
                  Aprobar
                </Button>
              </div>

            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            No hay solicitudes pendientes.
          </div>
        )}
      </div>

    </div>
  );
}
