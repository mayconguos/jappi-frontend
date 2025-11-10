import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
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
          <TableHead className="!text-center">Opciones</TableHead>
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
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  // onClick={() => onEdit(carrier)}
                  title="Ver"
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <Eye size={16} className='' />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(carrier)}
                  title="Editar"
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  title="Eliminar"
                  onClick={() => onDelete(carrier)}
                 className="text-red-600 hover:text-red-800 p-2"
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
