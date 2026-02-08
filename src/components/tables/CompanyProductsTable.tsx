import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

export interface CatalogProduct {
  id: number;
  id_product?: number;
  sku: string;
  product_name: string;
  description?: string;
  quantity: number;
  status: 'active' | 'inactive';
  last_updated: string;
}

interface CompanyProductsTableProps {
  products: CatalogProduct[];
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

export default function CompanyProductsTable({
  products,
  onEdit,
  onDelete,
}: CompanyProductsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[150px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</TableHead>
            <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Japi</TableHead>
            <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
            <TableHead className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Última Act.</TableHead>
            <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((item) => (
            <TableRow
              key={item.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs font-medium text-gray-500">
                {item.sku}
              </TableCell>

              <TableCell className="py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900">{item.product_name}</span>
                  {item.description && (
                    <span className="text-xs text-gray-400 truncate max-w-[200px]">{item.description}</span>
                  )}
                </div>
              </TableCell>

              <TableCell className="py-4 text-center">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                  <span className="text-xs font-bold text-gray-700">{item.quantity} und.</span>
                </div>
              </TableCell>

              <TableCell className="py-4 text-center">
                <span className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  getStatusBadge(item.status)
                )}>
                  {getStatusLabel(item.status)}
                </span>
              </TableCell>

              <TableCell className="py-4 text-right">
                <span className="text-sm text-gray-600">
                  {new Date(item.last_updated).toLocaleDateString()}
                </span>
              </TableCell>

              <TableCell className="text-right pr-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => onEdit(item)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    onClick={() => onDelete(item)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <Box className="text-gray-300" size={24} />
                  </div>
                  <p>Tu catálogo está vacío.</p>
                  <p className="text-xs text-gray-400">Agrega productos o impórtalos para comenzar.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
