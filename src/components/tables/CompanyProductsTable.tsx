import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Box, Info, Edit2 } from 'lucide-react';
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
      return 'bg-gray-50 text-gray-700 border-gray-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="w-[120px] text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</TableHead>
            {showCompanyNameColumn && (
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</TableHead>
            )}
            <TableHead className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</TableHead>
            <TableHead className="w-[120px] text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</TableHead>
            <TableHead className="w-[120px] text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</TableHead>
            <TableHead className="w-[120px] text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">Rotación</TableHead>
            <TableHead className="text-right pr-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((item, index) => {
             const rotStyle = getRotationStyle(item.last_updated);
             return (
              <TableRow
                key={item.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
              >
                <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="py-4 font-mono text-xs font-bold text-gray-900 tracking-tight">
                  {item.sku}
                </TableCell>
                {showCompanyNameColumn && (
                  <TableCell className="py-4">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{item.company_name || 'Sin empresa'}</span>
                  </TableCell>
                )}
                <TableCell className="py-4 text-left">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-900 leading-tight">{item.product_name}</span>
                    {item.description && (
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight truncate max-w-[200px] italic">{item.description}</span>
                    )}
                  </div>
                </TableCell>
  
                <TableCell className="py-4 text-center">
                  <span className={clsx(
                    "inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-bold",
                    item.quantity < 10 
                      ? "bg-red-50 text-red-700 border-red-100" 
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  )}>
                    {item.quantity} und.
                  </span>
                </TableCell>
  
                <TableCell className="py-4 text-center">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    getStatusBadge(item.status)
                  )}>
                    {getStatusLabel(item.status)}
                  </span>
                </TableCell>
  
                <TableCell className="py-4 text-right pr-4">
                  <div className={clsx(
                    "inline-flex flex-col items-end px-2 py-1 rounded-lg border shadow-sm transition-all text-[11px] font-bold",
                    rotStyle
                  )}>
                    {new Date(item.last_updated).toLocaleDateString()}
                  </div>
                </TableCell>
  
                <TableCell className="text-right pr-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      onClick={() => onEdit(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      onClick={() => onDelete(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
             );
          })}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={colSpanCount} className="h-48 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                   <Box className="text-gray-200" size={32} />
                  <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Sin Productos</p>
                  <p className="text-xs text-gray-400">Verifica los filtros o agrega productos para comenzar.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
