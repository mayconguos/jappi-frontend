'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Package, RefreshCw, AlertTriangle, UserCheck, Calendar, FileText } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Modal, ModalFooter } from '@/components/ui/modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Button } from '@/components/ui/button';

import KardexFilter from '@/components/filters/KardexFilter';
import KardexTable, { KardexMovement, MOVEMENT_MAPPING } from '@/components/tables/KardexTable';
import { useApi } from '@/hooks/useApi';

const ITEMS_PER_PAGE = 10;

export default function KardexPage() {
  const [movements, setMovements] = useState<KardexMovement[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({ from: undefined, to: undefined });
  const [movementType, setMovementType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Detail
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<KardexMovement | null>(null);

  const { get } = useApi<any>();

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        // NOTA: Se ha forzado ID=1 estático ya que la vista actual no cuenta con un contexto de ID por URL.
        const resp = await get('/inventory/kardex/1');
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
  }, [get]);

  // Reiniciar paginación si cambian los filtros
  useEffect(() => setCurrentPage(1), [searchTerm, dateRange, movementType]);

  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      // Filtro Search Term
      const matchesSearch =
        (mov.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (mov.product_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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

  const handleViewDetail = (mov: KardexMovement) => {
    setSelectedMovement(mov);
    setDetailModalOpen(true);
  };

  if (isInitialLoading) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-4">
        <DeliveryLoader message="Cargando histórico de kardex..." />
      </div>
    );
  }

  // Desestructuración segura
  const {
    id = 0, company_name = '', product_name = '',
    movement_type = 'initial_stock', quantity = 0, balance = 0, movement_date = ''
  } = selectedMovement || {};

  const configDetail = MOVEMENT_MAPPING[movement_type] || { label: movement_type, baseType: 'ADJUSTMENT' };
  const isInputDetail = configDetail.baseType === 'IN';

  let formattedDateDetail = 'Sin fecha';
  let formattedTimeDetail = '';
  if (movement_date) {
    try {
      const dt = new Date(movement_date);
      formattedDateDetail = dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
      formattedTimeDetail = dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-500">

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
          onViewDetail={handleViewDetail}
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

      {/* Modal Detalle Básico */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        size="md"
        title="Detalle del Movimiento"
        footer={
          <ModalFooter className="flex justify-end">
            <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>Cerrar</Button>
          </ModalFooter>
        }
      >
        {selectedMovement && (
          <div className="py-2 flex flex-col gap-5">

            {/* Header del modal */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{product_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{company_name}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg border font-bold text-sm flex gap-2 items-center ${configDetail.baseType === 'IN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                configDetail.baseType === 'OUT' ? 'bg-red-50 border-red-200 text-red-700' :
                  'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                {configDetail.label}
                <span className="text-lg font-mono tracking-tight">{isInputDetail ? '+' : configDetail.baseType === 'OUT' ? '-' : ''}{quantity}</span>
              </div>
            </div>

            {/* Grid de metadata */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Calendar size={12} /> Fecha y Hora</p>
                <p className="text-sm font-medium text-gray-800">{formattedDateDetail} a las {formattedTimeDetail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><UserCheck size={12} /> Origen Movimiento</p>
                <p className="text-sm font-medium text-gray-800">Sistema / APP</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><FileText size={12} /> ID Referencia</p>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">#{id}</button>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Saldo Post-Movimiento</p>
                <p className="text-sm font-mono font-bold bg-gray-100 px-2.5 py-1 rounded w-max text-gray-900">{balance} unidades</p>
              </div>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
