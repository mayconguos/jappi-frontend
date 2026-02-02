import { Search, Filter, Download, Calendar } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ShipmentsFilterProps {
    filterField: string;
    setFilterField: (value: string) => void;
    searchValue: string;
    setSearchValue: (value: string) => void;
    dateValue: string;
    setDateValue: (value: string) => void;
    onConsult: () => void;
    onExport: () => void;
    totalItems: number;
}

export default function ShipmentsFilter({
    filterField,
    setFilterField,
    searchValue,
    setSearchValue,
    dateValue,
    setDateValue,
    onConsult,
    onExport,
    totalItems,
}: ShipmentsFilterProps) {
    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32" />
            </div>

            <div className="flex flex-col lg:flex-row items-end gap-4 relative z-10 w-full xl:w-auto">
                {/* Date Group */}
                <div className="flex items-end gap-2 w-full sm:w-auto">
                    <div className="w-full sm:w-48">
                        <Input
                            label="Fecha"
                            type="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className="bg-white border-slate-200"
                            icon={Calendar}
                        />
                    </div>
                    <Button
                        onClick={onConsult}
                        className="bg-[#1a938e] hover:bg-[#157874] text-white shadow-lg shadow-emerald-100 whitespace-nowrap px-6 h-[42px] mb-[1px]"
                    >
                        Consultar
                    </Button>
                </div>

                {/* Filter & Search Group */}
                <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:w-auto">
                    <div className="w-full sm:w-48">
                        <Select
                            label="Filtrar por"
                            value={filterField}
                            onChange={setFilterField}
                            options={[
                                { label: 'Vendedor', value: 'vendor' },
                                { label: 'Producto', value: 'product' },
                                { label: 'Comprador', value: 'buyer' },
                            ]}
                            placeholder="Campo"
                            icon={Filter}
                            className="bg-white border-slate-200"
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <Input
                            label="Búsqueda"
                            placeholder="Buscar..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            icon={Search}
                            className="bg-white border-slate-200"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100 flex-wrap justify-between sm:justify-end w-full xl:w-auto">
                {/* Total Badge */}
                <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-sm font-medium text-emerald-700 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Total: <span className="text-emerald-900 font-bold">{totalItems}</span>
                </div>

                <div className="w-px h-8 bg-slate-200 hidden sm:block" />

                <Button
                    variant="secondary"
                    onClick={onExport}
                    className="flex items-center gap-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-all"
                >
                    <Download size={18} />
                    <span>Exportar</span>
                </Button>
            </div>
        </div>
    );
}
