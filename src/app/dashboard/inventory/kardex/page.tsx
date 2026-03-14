'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Package, RefreshCw, Search, Building2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';

import KardexFilter from '@/components/filters/KardexFilter';
import KardexTable, { KardexMovement, MOVEMENT_MAPPING } from '@/components/tables/KardexTable';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function KardexPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<KardexMovement[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({ from: undefined, to: undefined });
  const [movementType, setMovementType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Buscadores
  const [companySearchText, setCompanySearchText] = useState('');

  // Listas Dinámicas
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // IDs seleccionados para el filtro principal
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id_role === 2 && user?.id_company) {
      setSelectedCompanyId(user.id_company);
    }
  }, [user]);

  const { get } = useApi<any>();

  // Endpoint real para obtener empresas
  const fetchCompanies = async (query: string) => {
    setIsLoadingCompanies(true);
    try {
      const resp = await get('/user?type=companies');
      const allCompanies = Array.isArray(resp) ? resp : (resp?.data || []);

      // Filtramos localmente por el nombre de la empresa si hay un query
      const filtered = allCompanies.filter((c: any) => {
        const compName = c.company_name || '';
        return compName.toLowerCase().includes(query.toLowerCase());
      });

      // Ordenamos alfabéticamente para mejor experiencia
      filtered.sort((a: any, b: any) => (a.company_name || '').localeCompare(b.company_name || ''));

      setCompaniesList(filtered);
    } catch (error) {
      console.error("Error cargando empresas:", error);
      setCompaniesList([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  // Triggers de busqueda
  useEffect(() => {
    if (companySearchText.length > 2 || companySearchText === '') {
      const timeoutId = setTimeout(() => {
        fetchCompanies(companySearchText);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [companySearchText]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!selectedCompanyId) {
        setMovements([]);
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      try {
        const resp = await get(`/inventory/kardex/${selectedCompanyId}`);
        if (active) {
          setMovements(Array.isArray(resp) ? resp : (resp?.data || []));
        }
      } catch (err) {
        if (active) setMovements([]);
      } finally {
        if (active) setIsInitialLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [get, selectedCompanyId]);

  // Reiniciar paginación si cambian los filtros
  useEffect(() => setCurrentPage(1), [searchTerm, dateRange, movementType]);

  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      // Filtro Search Term General (Busca por producto, código/SKU (id_product) y empresa)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (mov.company_name?.toLowerCase() || '').includes(searchLower) ||
        (mov.product_name?.toLowerCase() || '').includes(searchLower) ||
        (mov.sku?.toLowerCase() || '').includes(searchLower) ||
        (String(mov.id_product) || '').includes(searchLower);
      if (!matchesSearch) return false;

      // Filtro Tipo
      if (movementType !== 'all') {
        const config = MOVEMENT_MAPPING[mov.movement_type];
        if (!config || config.baseType !== movementType) return false;
      }

      // Filtro Fechas (aproximado simple, comprobaremos si la fecha está dentro de dateRange)
      if (dateRange.from && mov.movement_date) {
        const mDate = new Date(mov.movement_date);
        const fDate = new Date(dateRange.from);
        fDate.setHours(0, 0, 0, 0);
        if (mDate < fDate) return false;
      }
      if (dateRange.to && mov.movement_date) {
        const mDate = new Date(mov.movement_date);
        const tDate = new Date(dateRange.to);
        tDate.setHours(23, 59, 59, 999);
        if (mDate > tDate) return false;
      }

      return true;
    });
  }, [movements, searchTerm, movementType, dateRange]);

  const metrics = useMemo(() => {
    let inTotal = 0;
    let outTotal = 0;
    movements.forEach(m => {
      const bType = MOVEMENT_MAPPING[m.movement_type]?.baseType;
      if (bType === 'IN') inTotal += m.quantity;
      if (bType === 'OUT') outTotal += m.quantity;
    });
    return { inTotal, outTotal };
  }, [movements]);

  const totalItems = filteredMovements.length;
  const currentItems = filteredMovements.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (selectedCompanyId === null) {
    return (
      <div className="w-full max-w-[800px] mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm w-full relative overflow-hidden">
          {/* Decors */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto mb-10">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-200">
              <Building2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Consulta de Kardex</h1>
            <p className="text-gray-500 text-base">Seleccione una empresa cliente para auditar todos sus movimientos de entradas, salidas y saldos históricos.</p>
          </div>

          <div className="relative z-10 max-w-xl mx-auto">

            {/* Selector Empresa */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col gap-4 transition-all hover:bg-slate-50 hover:border-indigo-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white p-2 rounded-lg shadow-sm text-gray-600">
                  <Search size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">Buscar Empresa</h3>
              </div>

              <div className="flex flex-col gap-2 relative">
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={companySearchText}
                    onChange={(e) => setCompanySearchText(e.target.value)}
                    placeholder="Escribe el nombre de la empresa..."
                    className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>

                {isLoadingCompanies ? (
                  <div className="py-8 flex justify-center"><RefreshCw className="animate-spin text-indigo-400" size={20} /></div>
                ) : companiesList.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500 bg-white rounded-lg border border-dashed border-gray-200">No se encontraron empresas</div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                    {companiesList.map(comp => (
                      <button
                        key={comp.id_company || comp.id}
                        onClick={() => setSelectedCompanyId(comp.id_company)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex justify-between items-center ${selectedCompanyId === comp.id_company ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:shadow-sm'}`}
                      >
                        {comp.company_name || 'Empresa sin nombre'}
                        {selectedCompanyId === comp.id_company && <ShieldCheck size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-4">
        <DeliveryLoader message="Cargando histórico de kardex..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-2 animate-in fade-in duration-500">

      {/* Identificador actual */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Histórico General</p>
            <h1 className="text-xl font-bold text-gray-900">
              {user?.id_role === 2 ? user?.name : companiesList.find(c => c.id_company === selectedCompanyId)?.company_name}
            </h1>
          </div>
        </div>
        {user?.id_role !== 2 && (
          <button onClick={() => { setSelectedCompanyId(null); setCompanySearchText(''); }} className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
            Cambiar Empresa
          </button>
        )}
      </div>

      {/* Cards de Resumen Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Entradas Totales</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.inTotal} <span className="text-sm font-normal text-emerald-600 ml-1">unidades</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Salidas Totales</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.outTotal} <span className="text-sm font-normal text-red-600 ml-1">unidades</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-indigo-500 font-medium">Auditoría</p>
            <h3 className="text-xl font-bold text-gray-900">Actualizado</h3>
          </div>
        </div>
      </div>

      <KardexFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
        movementType={movementType}
        setMovementType={setMovementType}
        onExportExcel={() => console.log('Exporting Excel')}
        onExportPdf={() => console.log('Exporting PDF')}
        totalItems={totalItems}
      />

      <div className="flex flex-col gap-6">
        <KardexTable
          movements={currentItems}
          currentPage={currentPage}
        />

        {totalItems > 0 && (
          <div className="flex justify-center sm:justify-end">
            <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {totalItems === 0 && searchTerm && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <RefreshCw className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-slate-500 font-medium">No se encontraron movimientos para "{searchTerm}"</p>
            <p className="text-sm text-slate-400 mt-1">Prueba limpiando los filtros o buscando otro código SKU.</p>
          </div>
        )}
      </div>

    </div>
  );
}
