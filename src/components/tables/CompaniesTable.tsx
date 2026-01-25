import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Building2, MapPin, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { Company } from '@/app/dashboard/accounts/companies/page';

interface CompaniesTableProps {
  companies: Company[];
  currentPage: number;
  onView: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export default function CompaniesTable({
  companies,
  currentPage,
  onView,
  onDelete,
}: CompaniesTableProps) {

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</TableHead>
            <TableHead className="hidden md:table-cell text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección</TableHead>
            <TableHead className="w-[100px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company, index) => (
            <TableRow
              key={company.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                {(currentPage - 1) * 10 + index + 1}
              </TableCell>

              <TableCell className="py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-gray-100 flex items-center justify-center text-gray-500 ring-1 ring-gray-100/50">
                    <Building2 size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{company.company_name}</span>
                    <span className="text-xs text-gray-500">ID: <span className="font-mono">{company.id}</span></span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-900">{company.first_name} {company.last_name}</span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Mail size={12} />
                      <span className="text-xs">{company.email}</span>
                    </div>
                    {company.phone_number && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Phone size={12} />
                        <span className="text-xs font-mono">{company.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell py-4">
                <div className="flex items-start gap-2 max-w-[250px]">
                  <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-500 leading-snug line-clamp-2" title={company.address}>
                    {company.address}
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-right pr-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onView(company)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Eye size={16} />
                    <span className="sr-only">Ver Detalle</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(company)}
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Building2 size={32} className="text-gray-300" />
                  <p className="text-sm">No se encontraron empresas</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
