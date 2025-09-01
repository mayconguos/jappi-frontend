import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Carrier } from '@/app/dashboard/carriers/page';

interface CarriersTableProps {
  carriers: Carrier[];
  currentPage: number;
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
}

export default function CarriersTable({
  carriers,
  currentPage,
  onEdit,
  onDelete,
}: CarriersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Placa</TableHead>
          <TableHead>Opciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carriers.map((carrier, index) => (
          <TableRow key={carrier.id}>
            <TableCell className="font-medium text-gray-600">
              {(currentPage - 1) * 10 + index + 1}
            </TableCell>
            <TableCell>
              {carrier.first_name} {carrier.last_name}
            </TableCell>
            <TableCell>{carrier.email}</TableCell>
            <TableCell>{carrier.plate_number}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(carrier)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                  title="Ver"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 hover:text-blue-800 p-2"
                  title="Editar"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Eliminar"
                  onClick={() => onDelete(carrier)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {carriers.length === 0 && (
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
