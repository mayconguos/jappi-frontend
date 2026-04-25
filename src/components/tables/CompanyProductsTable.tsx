import { Trash2, Info, Edit2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';
import { useAuth } from '@/context/AuthContext';

export interface CatalogProduct {
  id: number;
  id_product?: number;
  sku: string;
  product_name: string;
  company_name?: string;
  description?: string;
  quantity: number;
  status: 'active' | 'inactive';
  last_updated: string;
}

interface CompanyProductsTableProps {
  products: CatalogProduct[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (product: CatalogProduct) => void;
  onDelete: (product: CatalogProduct) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'inactive':
      return 'bg-slate-50 text-slate-700 border-slate-100';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-100';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Activo';
    case 'inactive': return 'Inactivo';
    default: return status;
  }
};

const getRotationStyle = (dateStr: string) => {
  const lastUpdate = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);

  if (diffDays > 365) return 'text-red-700 bg-red-50 border-red-200';
  if (diffDays > 180) return 'text-orange-700 bg-orange-50 border-orange-200';
  if (diffDays > 30) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-slate-700 bg-white border-slate-200';
};

export default function CompanyProductsTable({
  products,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
}: CompanyProductsTableProps) {
  const { user } = useAuth();
  
  // Hide the column if the user is an 'empresa' (role 2).
  const showCompanyNameColumn = user?.id_role !== 2;
  const colSpanCount = showCompanyNameColumn ? 8 : 7;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-2 py-3 text-center w-8">#</th>
              <th className="px-4 py-3 w-[120px]">SKU</th>
              {showCompanyNameColumn && (
                <th className="px-4 py-3">Empresa</th>
              )}
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-center w-[120px]">Stock</th>
              <th className="px-4 py-3 text-center w-[120px]">Estado</th>
              <th className="px-4 py-3 text-right w-[120px]">Rotación</th>
              <th className="px-4 py-3 text-right">Opciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {products.map((item, index) => {
             const rotStyle = getRotationStyle(item.last_updated);
             return (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-2 py-3 whitespace-nowrap text-center font-mono text-[11px] font-bold text-slate-300">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-sm font-semibold text-slate-700 tracking-tight">
                  {item.sku}
                </td>
                {showCompanyNameColumn && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">{item.company_name || 'Sin empresa'}</span>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-900 leading-tight">{item.product_name}</span>
                    {item.description && (
                      <span className="text-xs text-slate-400 font-medium truncate max-w-[250px]">{item.description}</span>
                    )}
                  </div>
                </td>
  
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={clsx(
                    "inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold",
                    item.quantity < 10 
                      ? "bg-red-50 text-red-700 border-red-100" 
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  )}>
                    {item.quantity} und.
                  </span>
                </td>
  
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    getStatusBadge(item.status)
                  )}>
                    {getStatusLabel(item.status)}
                  </span>
                </td>
  
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className={clsx(
                    "inline-flex flex-col items-end px-2.5 py-0.5 rounded-md border shadow-sm transition-all text-xs font-medium",
                    rotStyle
                  )}>
                    {new Date(item.last_updated).toLocaleDateString()}
                  </div>
                </td>
  
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      onClick={() => onEdit(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      onClick={() => onDelete(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
             );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={colSpanCount} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Sin Productos</h3>
                  <p className="text-slate-500">Verifica los filtros o agrega productos para comenzar.</p>
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
