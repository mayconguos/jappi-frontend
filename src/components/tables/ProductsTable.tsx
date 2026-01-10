import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search } from 'lucide-react';
import { Product } from '@/app/dashboard/warehouse/page';

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-gray-100">
            <TableHead className="w-16 text-center font-bold text-slate-700">#</TableHead>
            <TableHead className="font-bold text-slate-700">Producto</TableHead>
            <TableHead className="font-bold text-slate-700">Precio</TableHead>
            <TableHead className="font-bold text-slate-700 text-center">Stock Actual</TableHead>
            <TableHead className="font-bold text-slate-700 text-right">Último Movimiento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <TableCell className="text-center font-medium text-slate-500">
                {(currentPage - 1) * 10 + index + 1}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{product.product_name}</p>
                    <p className="text-xs text-slate-500">{product.company_name}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-slate-700 font-semibold">S/ {Number(product.price).toFixed(2)}</span>
              </TableCell>

              <TableCell className="text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${product.current_stock > 10
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                  {product.current_stock} und.
                </span>
              </TableCell>

              <TableCell className="text-right">
                <span className="text-sm text-slate-500 font-medium">
                  {new Date(product.last_movement).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <Search className="text-slate-300" size={24} />
                  </div>
                  <p>No se encontraron productos en el almacén</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
