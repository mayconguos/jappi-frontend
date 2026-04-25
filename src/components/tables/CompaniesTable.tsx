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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-2 py-3 text-center w-8">#</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="hidden md:table-cell px-4 py-3">Dirección</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {companies.map((company, index) => (
            <tr
              key={company.id}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="px-2 py-3 whitespace-nowrap text-center font-mono text-[11px] font-bold text-slate-300">
                {(currentPage - 1) * 10 + index + 1}
              </td>

              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm font-semibold text-slate-900">{company.company_name}</span>
              </td>

              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-900">{company.first_name} {company.last_name}</span>
                  {company.phone_number && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone size={12} />
                      <span className="text-xs font-mono">{company.phone_number}</span>
                    </div>
                  )}
                </div>
              </td>

              <td className="hidden md:table-cell px-4 py-3">
                <div className="flex items-start gap-2 max-w-[250px]">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-slate-500 leading-snug line-clamp-2" title={company.address}>
                    {company.address}
                  </p>
                </div>
              </td>

              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onView(company)}
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Eye size={16} />
                    <span className="sr-only">Ver Detalle</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(company)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan={5} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Building2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Sin Empresas</h3>
                  <p className="text-slate-500">No se encontraron empresas registradas.</p>
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
