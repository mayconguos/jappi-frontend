import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PendingFilterProps {
    value: string;
    setValue: (value: string) => void;
    totalItems: number;
}

export default function PendingFilter({
    value,
    setValue,
    totalItems,
}: PendingFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32" />
            </div>

            <div className="relative z-10 w-full sm:w-80">
                <Input
                    label="Búsqueda"
                    placeholder="Buscar empresa, representante o correo..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    icon={Search}
                    className="bg-white border-slate-200"
                />
            </div>

            <div className="flex items-center gap-4 relative z-10 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                {/* Total Badge */}
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Pendientes: <span className="text-slate-900 font-bold">{totalItems}</span>
                </div>
            </div>
        </div>
    );
}
