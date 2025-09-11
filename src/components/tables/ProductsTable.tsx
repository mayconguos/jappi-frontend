import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/app/dashboard/warehouse/page';

interface ProductsTableProps {
  products: Product[];
  currentPage: number;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductsTable({
  products,
  currentPage,
}: ProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product, index) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium text-gray-600">
              {(currentPage - 1) * 10 + index + 1}
            </TableCell>
            <TableCell>{product.company_name}</TableCell>
            <TableCell>{product.product_name}</TableCell>
            <TableCell>S/ {Number(product.price).toFixed(2)}</TableCell>
            <TableCell className="text-center">{product.current_stock}</TableCell>
            <TableCell>{new Date(product.last_movement).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
        {products.length === 0 && (
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
