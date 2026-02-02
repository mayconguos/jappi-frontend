import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search } from 'lucide-react';
import { Product } from '@/app/dashboard/inventory/main/page';

interface ProductsTableProps {
  products: Product[];
  currentPage: number;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductsTable({
  products,
  currentPage,
}: ProductsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableHead className="w-[50px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</TableHead>
            <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Actual</TableHead>
            <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Último Movimiento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow
              key={product.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                {(currentPage - 1) * 10 + index + 1}
              </TableCell>

              <TableCell className="py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 ring-1 ring-gray-100/50">
                    <Package size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{product.product_name}</span>
                    <span className="text-xs text-gray-500">{product.company_name}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-4">
                <span className="text-sm font-medium text-gray-700">S/ {Number(product.price).toFixed(2)}</span>
              </TableCell>

              <TableCell className="py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.current_stock > 10
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                  {product.current_stock} und.
                </span>
              </TableCell>

              <TableCell className="text-right pr-6 py-4">
                <div className="flex items-center justify-end gap-1.5 text-gray-500">
                  <span className="text-xs font-medium">
                    {new Date(product.last_movement).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-16 text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <Search className="text-gray-300" size={24} />
                  </div>
                  <p className="text-sm">No se encontraron productos en el almacén</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
