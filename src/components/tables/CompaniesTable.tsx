import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Building2 } from 'lucide-react';
import { Company } from '@/app/dashboard/accounts/companies/page';

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-gray-100">
            <TableHead className="w-16 text-center font-bold text-slate-700">#</TableHead>
            <TableHead className="font-bold text-slate-700">Nombre</TableHead>
            <TableHead className="font-bold text-slate-700">Correo</TableHead>
            <TableHead className="font-bold text-slate-700">Documento</TableHead>
            <TableHead className="text-center font-bold text-slate-700 !text-center">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company, index) => (
            <TableRow key={company.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <TableCell className="text-center font-medium text-slate-500">
                {(currentPage - 1) * 10 + index + 1}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{company.first_name} {company.last_name}</p>
                    <p className="text-xs text-slate-500">ID: {company.id}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-slate-600 font-medium">{company.email}</span>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">{company.document_number}</span>
                  <span className="text-xs text-slate-500 uppercase">{company.document_type}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="icon"
                    variant="icon-edit"
                    onClick={() => onEdit(company)}
                    className="h-8 w-8 !rounded-full !border-0 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="icon-delete"
                    onClick={() => onDelete(company)}
                    className="h-8 w-8 !rounded-full !border-0 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700"
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
              <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <Building2 className="text-slate-300" size={24} />
                  </div>
                  <p>No se encontraron empresas</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
