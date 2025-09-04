import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Company } from '@/app/dashboard/companies/page';

interface CompaniesTableProps {
  companies: Company[];
  currentPage: number;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export default function CompaniesTable({
  companies,
  currentPage,
  onEdit,
  onDelete,
}: CompaniesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Opciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company, index) => (
          <TableRow key={company.id}>
            <TableCell className="font-medium text-gray-600">
              {(currentPage - 1) * 10 + index + 1}
            </TableCell>
            <TableCell>{company.first_name} {company.last_name}</TableCell>
            <TableCell>{company.email}</TableCell>
            <TableCell>{company.document_number}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(company)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                  title="Editar"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(company)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {companies.length === 0 && (
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
