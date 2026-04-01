import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Carrier } from '@/app/dashboard/accounts/carriers/page';

interface CarriersTableProps {
  carriers: Carrier[];
  currentPage: number;
  itemsPerPage?: number;
  onView: (carrier: Carrier) => void;
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
  onReactivate?: (carrier: Carrier) => void;
}

export default function CarriersTable({
  carriers,
  currentPage,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  onReactivate
}: CarriersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative transition-all">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[60px] pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">#</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transportista / Correo</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vehículo / Marca</TableHead>
            <TableHead className="w-[100px] text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Placa</TableHead>
            <TableHead className="w-[140px] text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</TableHead>
            <TableHead className="w-[140px] text-right pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carriers.map((carrier, index) => {
            const isSoftDeleted = carrier.status === 2;
            const statusActive = carrier.status === 1 || carrier.status === 0;

            return (
              <TableRow
                key={carrier.id}
                className={`border-b border-gray-50 hover:bg-slate-50/50 transition-all group ${
                  isSoftDeleted ? 'bg-slate-50/80' : ''
                }`}
              >
                <TableCell className="pl-6 py-4 font-mono text-[11px] font-bold text-slate-300">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                
                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm font-bold leading-tight group-hover:text-emerald-700 transition-colors ${
                      isSoftDeleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'
                    }`}>
                      {carrier.first_name} {carrier.last_name || ''}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">{carrier.email}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-700 leading-tight">{carrier.vehicle_type}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {carrier.brand} {carrier.plate_number ? `- ${carrier.plate_number}` : ''}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <span className="inline-flex px-2 py-0.5 bg-white rounded-lg text-[11px] font-extrabold text-slate-700 border border-slate-200 shadow-sm">
                    {carrier.plate_number || 'S/P'}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  {isSoftDeleted ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-500 border-slate-200">
                      Eliminado
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                      statusActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {statusActive ? 'Activo' : 'Inactivo'}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    {isSoftDeleted ? (
                       <Button
                        onClick={() => onReactivate?.(carrier)}
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-[10px] font-bold uppercase tracking-widest shadow-md shadow-emerald-900/10 rounded-lg pr-3"
                      >
                        <RotateCcw size={14} />
                        Reactivar
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onView(carrier)}
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg hover:shadow-md hover:shadow-indigo-50 transition-all"
                          title="Detalles"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(carrier)}
                          className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg hover:shadow-md hover:shadow-emerald-50 transition-all"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar"
                          onClick={() => onDelete(carrier)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg hover:shadow-md hover:shadow-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {carriers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <span className="text-2xl opacity-30">🚛</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin transportistas</p>
                    <p className="text-xs text-slate-300 mt-1">No se encontraron resultados en esta categoría.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
