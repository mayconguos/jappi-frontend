import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Mail, Phone, Building2 } from 'lucide-react';

export interface UnverifiedCompany {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    company_name: string;
    phone_number: string;
}

interface PendingTableProps {
    companies: UnverifiedCompany[];
    onActivate: (company: UnverifiedCompany) => void;
    onReject: (company: UnverifiedCompany) => void;
}

export default function PendingTable({
    companies,
    onActivate,
    onReject,
}: PendingTableProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                        <TableHead className="pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Representante</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</TableHead>
                        <TableHead className="w-[120px] text-right pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {companies.map((item) => (
                        <TableRow
                            key={item.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                        >
                            <TableCell className="pl-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 min-w-[2.5rem] rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase ring-1 ring-indigo-100/50">
                                        {item.company_name.substring(0, 2)}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-gray-900">{item.company_name}</span>
                                        <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                            Pendiente
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-gray-900">{item.first_name} {item.last_name}</span>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Mail size={12} />
                                        <span className="text-xs">{item.email}</span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="py-4">
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <Phone size={14} className="text-gray-400" />
                                    <span className="text-xs font-mono">{item.phone_number}</span>
                                </div>
                            </TableCell>

                            <TableCell className="text-right pr-6 py-4">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        onClick={() => onReject(item)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        title="Rechazar"
                                    >
                                        <X size={16} />
                                        <span className="sr-only">Rechazar</span>
                                    </Button>
                                    <Button
                                        onClick={() => onActivate(item)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                        title="Aprobar"
                                    >
                                        <Check size={16} />
                                        <span className="sr-only">Aprobar</span>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {companies.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                No hay solicitudes pendientes.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
