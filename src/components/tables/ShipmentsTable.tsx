import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Shipment {
    id: number;
    vendedor: string;
    producto: string;
    cantidad: number;
    fechaEntrega: string;
    comprador: string;
    telefono: string;
    montoTotal: string;
    metodoPago: string;
    modoEntrega: string;
    distrito: string;
    estado: string;
    delivery: string;
    dniMoto: string;
    motorizado: string;
    placa: string;
    motivo: string;
}

interface ShipmentsTableProps {
    shipments: Shipment[];
    onView: (shipment: Shipment) => void;
}

export default function ShipmentsTable({
    shipments,
    onView,
}: ShipmentsTableProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                        <TableHead className="w-[60px] pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendedor / Comprador</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Cant.</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrega</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</TableHead>
                        <TableHead className="text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalles</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shipments.map((item) => (
                        <TableRow
                            key={item.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                        >
                            <TableCell className="pl-6 py-4 font-mono text-xs text-gray-400">
                                #{item.id}
                            </TableCell>

                            <TableCell className="py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-gray-900">{item.vendedor}</span>
                                    <span className="text-xs text-gray-500">Para: {item.comprador}</span>
                                </div>
                            </TableCell>

                            <TableCell className="py-4 max-w-[200px]">
                                <p className="text-sm text-gray-600 truncate" title={item.producto}>
                                    {item.producto}
                                </p>
                            </TableCell>

                            <TableCell className="py-4 text-center">
                                <span className="text-sm font-medium text-gray-700">{item.cantidad}</span>
                            </TableCell>

                            <TableCell className="py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm text-gray-700">{item.fechaEntrega}</span>
                                    <span className="text-[10px] text-gray-400 uppercase">{item.modoEntrega}</span>
                                </div>
                            </TableCell>

                            <TableCell className="py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.estado === 'entregado'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}>
                                    {item.estado}
                                </span>
                            </TableCell>

                            <TableCell className="py-4">
                                <span className="text-sm font-bold text-emerald-600">{item.montoTotal}</span>
                            </TableCell>

                            <TableCell className="text-right pr-6 py-4">
                                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        onClick={() => onView(item)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-normal"
                                    >
                                        <Eye size={16} />
                                        <span className="text-xs">Ver</span>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {shipments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                                No hay envíos registrados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
