import { Search, Plus, Upload, Mail, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type RotationType = 'all' | 'stale_1m' | 'stale_6m' | 'stale_1y';

interface ProductsFilterProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  rotationFilter?: RotationType;
  setRotationFilter?: (value: RotationType) => void;
  onSendEmails?: () => void;
  isSendingEmails?: boolean;
  onAdd?: () => void;
  onImport?: () => void;
  totalItems: number;
  hideActions?: boolean;
}

export default function ProductsFilter({
  searchValue,
  setSearchValue,
  rotationFilter = 'all',
  setRotationFilter,
  onSendEmails,
  isSendingEmails = false,
  onAdd,
  onImport,
  totalItems,
  hideActions = false,
}: Readonly<ProductsFilterProps>) {
  const rotationOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'stale_1m', label: '> 1 Mes' },
    { value: 'stale_6m', label: '> 6 Meses' },
    { value: 'stale_1y', label: '> 1 Año' },
  ];

  const showEmailButton = rotationFilter !== 'all';

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0 opacity-50" />

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10 w-full">
        <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto items-end">
          {/* Search Bar */}
          <div className="w-full sm:w-80">
            <Input
              label="Búsqueda"
              placeholder="Nombre o SKU..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              icon={Search}
              className="bg-white border-slate-200"
            />
          </div>

          {/* Rotation Tabs */}
          {setRotationFilter && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">
                Rotación de Inventario (Últ. Act.)
              </span>
              <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 w-fit">
                {rotationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRotationFilter(opt.value as RotationType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      rotationFilter === opt.value
                        ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Enviar Correos */}
          {showEmailButton && onSendEmails && (
             <div className="flex items-end animate-in slide-in-from-left-4 fade-in duration-300">
               <Button
                onClick={onSendEmails}
                disabled={isSendingEmails}
                className="h-10 px-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/10 rounded-xl min-w-[140px]"
              >
                {isSendingEmails ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Mail size={18} />
                )}
                <span className="text-sm font-bold">
                  {isSendingEmails ? 'Enviando...' : 'Enviar alertas'}
                </span>
              </Button>
             </div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100 flex-wrap justify-between sm:justify-end w-full xl:w-auto">
          {/* Total Badge */}
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Total: <span className="text-slate-900 font-bold">{totalItems}</span>
          </div>

          {!hideActions && (
            <>
              <div className="w-px h-8 bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {onImport && (
                  <Button
                    variant="secondary"
                    onClick={onImport}
                    className="flex-1 sm:flex-none gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  >
                    <Upload size={18} />
                    <span>Importar</span>
                  </Button>
                )}

                {onAdd && (
                  <Button
                    onClick={onAdd}
                    className="flex-1 sm:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                  >
                    <Plus size={18} />
                    <span>Nuevo</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
