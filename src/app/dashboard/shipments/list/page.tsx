'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { Loader2, Package, MapPin, Phone, Calendar, BadgeDollarSign, Info } from 'lucide-react';

// Hooks & Context
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

// Components
import ShipmentsFilter from '@/components/filters/ShipmentsFilter';
import ShipmentsTable, { Shipment } from '@/components/tables/ShipmentsTable';

export default function ShipmentsPage() {
  const { user } = useAuth();
  const { get, loading } = useApi<Shipment[]>();
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filterField, setFilterField] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({ from: undefined, to: undefined });

  // Fetch Data
  useEffect(() => {
    const fetchShipments = async () => {
      const idCompany = user?.id_company || user?.id; // Fallback to user ID if company ID is not available
      if (idCompany) {
        const data = await get(`/shipping/${idCompany}`);
        if (data) {
          setAllShipments(data);
        }
      }
    };

    if (user) {
      fetchShipments();
    }
  }, [user, get]);

  const handleOpenModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
  };

  const handleCloseModal = () => {
    setSelectedShipment(null);
  };

  // Filter Logic
  const filteredShipments = allShipments.filter(item => {
    // Basic search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();

      if (filterField && filterField in item) {
        const value = item[filterField as keyof Shipment];
        if (!value?.toString().toLowerCase().includes(searchLower)) return false;
      } else {
        // General search if no specific field is selected
        const matchesSearch =
          item.company_name.toLowerCase().includes(searchLower) ||
          item.customer_name.toLowerCase().includes(searchLower) ||
          item.product_name.toLowerCase().includes(searchLower) ||
          item.id.toString().includes(searchLower);

        if (!matchesSearch) return false;
      }
    }

    // Filter by Date Range
    if (dateRange.from && item.shipping_date) {
      const shipDate = new Date(item.shipping_date);
      shipDate.setHours(0, 0, 0, 0);
      const fDate = new Date(dateRange.from);
      fDate.setHours(0, 0, 0, 0);
      if (shipDate < fDate) return false;
    }

    if (dateRange.to && item.shipping_date) {
      const shipDate = new Date(item.shipping_date);
      shipDate.setHours(23, 59, 59, 999);
      const tDate = new Date(dateRange.to);
      tDate.setHours(23, 59, 59, 999);
      if (shipDate > tDate) return false;
    }

    return true;
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, filterField, dateRange]);

  const totalItems = filteredShipments.length;
  const currentItems = filteredShipments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      <div className="space-y-6">
        {/* Filters */}
        <ShipmentsFilter
          filterField={filterField}
          setFilterField={setFilterField}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onExport={() => { }}
          totalItems={filteredShipments.length}
        />

        {/* Table Area */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Cargando envíos...</p>
            </div>
          ) : (
            <>
              <ShipmentsTable
                shipments={currentItems}
                onView={handleOpenModal}
              />
              {totalItems > 0 && (
                <div className="flex justify-center sm:justify-end mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedShipment}
        onClose={handleCloseModal}
        size="xl"
        title={`Detalle de Envío #${selectedShipment?.id.toString().padStart(5, '0')}`}
        showCloseButton={true}
        footer={
          <ModalFooter>
            <div className="flex w-full justify-between items-center">
              <Button variant="ghost" onClick={handleCloseModal} className="text-gray-500 hover:text-gray-900">
                Cerrar
              </Button>
              <Button className="bg-[#1a938e] text-white hover:bg-[#157874] shadow-md shadow-emerald-500/10">
                Imprimir Etiqueta
              </Button>
            </div>
          </ModalFooter>
        }
      >
        {selectedShipment && (
          <div className="flex flex-col gap-6">

            {/* Primera Fila: Cliente & Producto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Info Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Información del Cliente
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold">Cliente</p>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{selectedShipment.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold">Teléfono</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedShipment.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold">Dirección de Entrega</p>
                      <p className="font-medium text-gray-700 text-sm leading-snug">{selectedShipment.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Detail Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Detalles del Pedido
                </h4>
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold mb-2">Producto(s)</p>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-sm font-medium text-gray-800 leading-relaxed italic">
                        "{selectedShipment.product_name}"
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-gray-400 text-[10px] uppercase tracking-wide font-bold mb-1">Fecha Programada</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <p className="font-bold text-slate-700 text-sm">{new Date(selectedShipment.shipping_date).toLocaleDateString('es-PE')}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-gray-400 text-[10px] uppercase tracking-wide font-bold mb-1">Costo Envío</p>
                      <div className="flex items-center gap-2">
                        <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="font-bold text-emerald-700 text-sm">S/ {Number(selectedShipment.delivery_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda Fila: Monto Total & Observación */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <BadgeDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-[11px] uppercase tracking-widest font-bold">Total a Cobrar</p>
                    <p className="text-3xl font-black tabular-nums">S/ {Number(selectedShipment.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                <div className="h-px w-full md:h-12 md:w-px bg-white/20"></div>

                <div className="flex-1 w-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-full">
                      <p className="text-white/70 text-[11px] uppercase tracking-widest font-bold mb-1">Observaciones</p>
                      <p className="text-sm font-medium leading-normal line-clamp-2">
                        {selectedShipment.observation || 'Sin observaciones adicionales para este envío.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}

