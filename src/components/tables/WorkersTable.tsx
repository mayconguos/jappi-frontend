import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead className="!text-center">Opciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workers.map((worker, index) => (
          <TableRow key={worker.id}>
            <TableCell className="font-medium text-gray-600">
              {(currentPage - 1) * 10 + index + 1}
            </TableCell>
            <TableCell>{getUserRoleLabel(worker.id_role)}</TableCell>
            <TableCell>{worker.first_name} {worker.last_name}</TableCell>
            <TableCell>{worker.document_number}</TableCell>
            <TableCell>{worker.email}</TableCell>
            <TableCell>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="icon-edit"
                  onClick={() => onEdit(worker)}
                  title="Editar"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="icon-delete"
                  onClick={() => onDelete(worker)}
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
            <TableCell colSpan={7} className="text-center py-4 text-gray-500">
              No hay resultados
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
