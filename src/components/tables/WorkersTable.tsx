import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User } from 'lucide-react';
import { getUserRoleLabel } from '@/constants/userRoles';
import { Worker } from '@/app/dashboard/workers/page';

interface WorkersTableProps {
  workers: Worker[];
  currentPage: number;
  onEdit: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
}

export default function WorkersTable({
  workers,
  currentPage,
  onEdit,
  onDelete,
}: WorkersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-gray-100">
            <TableHead className="w-16 text-center font-bold text-slate-700">#</TableHead>
            <TableHead className="font-bold text-slate-700">Usuario</TableHead>
            <TableHead className="font-bold text-slate-700">Rol / Tipo</TableHead>
            <TableHead className="font-bold text-slate-700">Documento</TableHead>
            <TableHead className="text-center font-bold text-slate-700 !text-center">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker, index) => (
            <TableRow key={worker.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <TableCell className="text-center font-medium text-slate-500">
                {(currentPage - 1) * 10 + index + 1}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 border border-blue-100">
                    {worker.first_name?.[0]}{worker.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-tight">{worker.first_name} {worker.last_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{worker.email}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${worker.id_role === 1
                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                  {getUserRoleLabel(worker.id_role)}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-slate-600 font-medium">{worker.document_number}</span>
              </TableCell>

              <TableCell>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="icon"
                    variant="icon-edit"
                    onClick={() => onEdit(worker)}
                    className="h-8 w-8 !rounded-full !border-0 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 shadow-sm"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="icon-delete"
                    onClick={() => onDelete(worker)}
                    className="h-8 w-8 !rounded-full !border-0 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 shadow-sm"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {workers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <User className="text-slate-300" size={24} />
                  </div>
                  <p>No se encontraron usuarios</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
