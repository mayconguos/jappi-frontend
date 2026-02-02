import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CatalogProduct {
    id: number;
    sku: string;
    product_name: string;
    description?: string;
    category?: string;
    image_url?: string;
    stock: number;
    status: 'active' | 'inactive';
}

interface CompanyProductsTableProps {
    products: CatalogProduct[];
    onEdit: (product: CatalogProduct) => void;
    onDelete: (product: CatalogProduct) => void;
}

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
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Japi</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
                        <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((item) => (
                        <TableRow
                            key={item.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                        >
                            <TableCell className="pl-6 py-4 font-mono text-xs font-medium text-emerald-700">
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

                            <TableCell className="py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                    {item.category || 'General'}
                                </span>
                            </TableCell>

                            <TableCell className="py-4 text-center">
                                <span className={`text-sm font-bold ${item.stock > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {item.stock}
                                </span>
                            </TableCell>

                            <TableCell className="py-4 text-center">
                                <span className={`inline-flex w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-gray-300'}`} />
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
