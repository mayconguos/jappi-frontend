import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Mail, CreditCard } from 'lucide-react';
import { getUserRoleLabel } from '@/constants/userRoles';
import { Worker } from '@/app/dashboard/accounts/workers/page';

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Documento</TableHead>
            <TableHead className="w-[100px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker, index) => (
            <TableRow
              key={worker.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                {(currentPage - 1) * 10 + index + 1}
              </TableCell>

              <TableCell className="py-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 min-w-[2.5rem] rounded-full flex items-center justify-center ring-1 ring-gray-100/50 text-sm ${worker.first_name || worker.last_name ? 'bg-gray-100 text-gray-500 font-medium' : 'bg-gray-50 text-gray-300'
                    }`}>
                    {worker.first_name || worker.last_name ? (
                      <>
                        {worker.first_name?.[0] || ''}{worker.last_name?.[0] || ''}
                      </>
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm ${worker.first_name || worker.last_name ? 'font-medium text-gray-900' : 'text-gray-400 italic'}`}>
                      {(worker.first_name || worker.last_name)
                        ? `${worker.first_name || ''} ${worker.last_name || ''}`.trim()
                        : 'Sin nombre'}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Mail size={12} />
                      <span className="text-xs">{worker.email || 'Sin correo'}</span>
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${worker.id_role === 1
                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                  {getUserRoleLabel(worker.id_role)}
                </span>
              </TableCell>

              <TableCell className="py-4">
                {worker.document_number ? (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CreditCard size={14} className="text-gray-400" />
                    <span className="text-sm font-medium">{worker.document_number}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No registrado</span>
                )}
              </TableCell>

              <TableCell className="text-right pr-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(worker)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Edit size={16} />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(worker)}
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {workers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <User size={32} className="text-gray-300" />
                  <p className="text-sm">No se encontraron usuarios</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
