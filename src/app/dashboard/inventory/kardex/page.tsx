'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Package, RefreshCw, AlertTriangle, UserCheck, Calendar, FileText } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Modal, ModalFooter } from '@/components/ui/modal';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Button } from '@/components/ui/button';

import KardexFilter from '@/components/filters/KardexFilter';
import KardexTable, { KardexMovement } from '@/components/tables/KardexTable';

// ─── MOCK DATA TEMPORAL ──────────────────────────────────────────
const MOCK_KARDEX_MOVEMENTS: KardexMovement[] = [
  { id: 'MOV-1004', date: '09 Mar 2026', time: '14:30', product_sku: 'SKU-775-A', product_name: 'Cajas de Zapatos Modelo X', movement_type: 'OUT', quantity: 15, balance: 85, reference_document: 'Despacho #802', user: 'Admin' },
  { id: 'MOV-1003', date: '09 Mar 2026', time: '10:15', product_sku: 'SKU-775-A', product_name: 'Cajas de Zapatos Modelo X', movement_type: 'IN', quantity: 50, balance: 100, reference_document: 'Recojo #9001', user: 'Admin' },
  { id: 'MOV-1002', date: '08 Mar 2026', time: '16:45', product_sku: 'SKU-102-B', product_name: 'Teclados Mecánicos TKL', movement_type: 'OUT', quantity: 5, balance: 12, reference_document: 'Despacho #801', user: 'Juan Perez' },
  { id: 'MOV-1001', date: '08 Mar 2026', time: '09:00', product_sku: 'SKU-102-B', product_name: 'Teclados Mecánicos TKL', movement_type: 'ADJUSTMENT', quantity: 2, balance: 17, reference_document: 'Auditoría Mensual', user: 'Admin' },
];

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

  useEffect(() => {
    // Simulando fetch de la API
    const loadData = async () => {
      setIsInitialLoading(true);
      await new Promise(res => setTimeout(res, 800));
      setMovements(MOCK_KARDEX_MOVEMENTS);
      setIsInitialLoading(false);
    };
    loadData();
  }, []);

  // Reiniciar paginación si cambian los filtros
  useEffect(() => setCurrentPage(1), [searchTerm, dateRange, movementType]);

  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      // Filtro Search Term
      const matchesSearch =
        mov.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Filtro Tipo
      if (movementType !== 'all' && mov.movement_type !== movementType) return false;

      // Filtro Fechas (aproximado usando el string nativo html date YYYY-MM-DD vs DD MMM YYYY del mock)
      // En entorno de prod se manejarían milisegundos reales o timestamps iso.

      return true;
    });
  }, [movements, searchTerm, movementType, dateRange]);

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
    id = '', date = '', time = '', product_name = '', product_sku = '',
    movement_type = 'IN', quantity = 0, balance = 0, reference_document = '', user = ''
  } = selectedMovement || {};

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
            <h3 className="text-2xl font-bold text-gray-900">50 <span className="text-sm font-normal text-emerald-600 ml-1">unidades</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Salidas Totales</p>
            <h3 className="text-2xl font-bold text-gray-900">20 <span className="text-sm font-normal text-red-600 ml-1">unidades</span></h3>
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
                <p className="text-sm text-gray-500 font-mono mt-1">SKU: {product_sku}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg border font-bold text-sm flex gap-2 items-center ${movement_type === 'IN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  movement_type === 'OUT' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                {movement_type === 'IN' ? 'Entrada' : movement_type === 'OUT' ? 'Salida' : 'Ajuste'}
                <span className="text-lg font-mono tracking-tight">{movement_type === 'IN' ? '+' : movement_type === 'OUT' ? '-' : ''}{quantity}</span>
              </div>
            </div>

            {/* Grid de metadata */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Calendar size={12} /> Fecha y Hora</p>
                <p className="text-sm font-medium text-gray-800">{date} a las {time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><UserCheck size={12} /> Responsable</p>
                <p className="text-sm font-medium text-gray-800">{user}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><FileText size={12} /> Doc. Referencia</p>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">{reference_document}</button>
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
