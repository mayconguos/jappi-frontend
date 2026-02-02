import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Carrier } from '@/app/dashboard/accounts/carriers/page';

interface CarriersTableProps {
  carriers: Carrier[];
  currentPage: number;
  onView: (carrier: Carrier) => void;
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
}

export default function CarriersTable({
  carriers,
  currentPage,
  onView,
  onEdit,
  onDelete,
}: CarriersTableProps) {
  return (
    <div className="rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</TableHead>
            <TableHead className="w-[100px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carriers.map((carrier, index) => (
            <TableRow
              key={carrier.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                {(currentPage - 1) * 10 + index + 1}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900">{carrier.first_name} {carrier.last_name || ''}</span>
                  <span className="text-xs text-gray-500">
                    <span className="font-medium text-gray-400">{carrier.document_type}:</span> {carrier.document_number}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <span className="text-sm text-gray-600">{carrier.email}</span>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 bg-gray-100 rounded text-xs font-mono font-medium text-gray-600 border border-gray-200 uppercase">
                    {carrier.plate_number || '---'}
                  </div>
                  <span className="text-xs text-gray-500">{carrier.vehicle_type}</span>
                </div>
              </TableCell>
              <TableCell className="text-right pr-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onView(carrier)}
                    className="h-8 w-8 text-gray-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    title="Ver"
                  >
                    <Eye size={16} />
                    <span className="sr-only">Ver</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(carrier)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    title="Editar"
                  >
                    <Edit size={16} />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Eliminar"
                    onClick={() => onDelete(carrier)}
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={16} />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {carriers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                  <span className="text-sm">No hay transportistas registrados</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
