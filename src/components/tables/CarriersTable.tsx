import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Carrier } from '@/app/dashboard/accounts/carriers/page';

interface CarriersTableProps {
  carriers: Carrier[];
  currentPage: number;
  itemsPerPage?: number;
  onView: (carrier: Carrier) => void;
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
}

export default function CarriersTable({
  carriers,
  currentPage,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
}: CarriersTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent text-gray-500">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Transportista / Correo</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Vehículo / Modelo</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Placa</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Estado</TableHead>
            <TableHead className="w-[100px] text-right pr-6 text-xs font-semibold uppercase tracking-wider">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carriers.map((carrier, index) => {
            const statusActive = carrier.status === 1 || carrier.status === 0;

            return (
              <TableRow
                key={carrier.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                
                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900 leading-none">{carrier.first_name} {carrier.last_name || ''}</span>
                    <span className="text-[11px] text-gray-400 font-medium">{carrier.email}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-700 leading-none">{carrier.vehicle_type}</span>
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                      {carrier.brand} {carrier.model}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-gray-700 border border-slate-200">
                    {carrier.plate_number || 'S/P'}
                  </span>
                </TableCell>

                <TableCell className="py-4 text-xs">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    statusActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    {statusActive ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onView(carrier)}
                      className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(carrier)}
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Eliminar"
                      onClick={() => onDelete(carrier)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {carriers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-300 text-6xl italic opacity-50">🚛</span>
                  <p className="text-sm font-medium">No hay transportistas registrados</p>
                  <p className="text-xs text-gray-400">Tus colaboradores aparecerán aquí una vez que los registres.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
