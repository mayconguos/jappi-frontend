'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';

// Components
import ShipmentsFilter from '@/components/filters/ShipmentsFilter';
import ShipmentsTable, { Shipment } from '@/components/tables/ShipmentsTable';

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 1,
    vendedor: "sakira's collection",
    producto: "1 FALDA TALLA M Y 1 BLUSA TALLA S",
    cantidad: 1,
    fechaEntrega: "27-12-2024",
    comprador: "Maria Igreda",
    telefono: "963004636",
    montoTotal: "S/0.00",
    metodoPago: "No tiene",
    modoEntrega: "solo Entregar",
    distrito: "San Luis",
    estado: "entregado",
    delivery: "S/10.00",
    dniMoto: "76743332",
    motorizado: "JOSE ARAYA",
    placa: "2375-7D",
    motivo: "No tiene"
  },
  {
    id: 2,
    vendedor: "sakira's collection",
    producto: "1 BLUSA COLOR ROJO TALLA M",
    cantidad: 1,
    fechaEntrega: "23-12-2024",
    comprador: "Brenda Veliz Huanca",
    telefono: "998823226",
    montoTotal: "S/60.00",
    metodoPago: "Efectivo",
    modoEntrega: "contra-entrega",
    distrito: "El Agustino",
    estado: "entregado",
    delivery: "S/12.00",
    dniMoto: "76743332",
    motorizado: "JOSE ARAYA",
    placa: "2375-7D",
    motivo: "No tiene"
  },
  {
    id: 3,
    vendedor: "sakira's collection",
    producto: "1 enterizo color negro talla L",
    cantidad: 1,
    fechaEntrega: "23-12-2024",
    comprador: "Fiorella Lopez Cordova",
    telefono: "920149485",
    montoTotal: "S/50.00",
    metodoPago: "Abono a Japi",
    modoEntrega: "contra-entrega",
    distrito: "San Isidro",
    estado: "entregado",
    delivery: "S/10.00",
    dniMoto: "76743332",
    motorizado: "JOSE ARAYA",
    placa: "2375-7D",
    motivo: "No tiene"
  },
  {
    id: 4,
    vendedor: "sakira's collection",
    producto: "FALDA COLOR NEGRO",
    cantidad: 1,
    fechaEntrega: "28-05-2024",
    comprador: "Ana Chavez Scott",
    telefono: "985678150",
    montoTotal: "S/0.00",
    metodoPago: "No tiene",
    modoEntrega: "solo Entregar",
    distrito: "San Isidro",
    estado: "entregado",
    delivery: "S/10.00",
    dniMoto: "No tiene",
    motorizado: "No tiene",
    placa: "No tiene",
    motivo: "No tiene"
  },
  {
    id: 5,
    vendedor: "sakira's collection",
    producto: "FALDA TALLA L",
    cantidad: 1,
    fechaEntrega: "22-05-2024",
    comprador: "Alberto Sanchez",
    telefono: "964238696",
    montoTotal: "S/79.00",
    metodoPago: "Abono a vendedor",
    modoEntrega: "contra-entrega",
    distrito: "Santiago de Surco",
    estado: "entregado",
    delivery: "S/13.00",
    dniMoto: "76743332",
    motorizado: "JOSE ARAYA",
    placa: "2375-7D",
    motivo: "No tiene"
  },
  {
    id: 6,
    vendedor: "sakira's collection",
    producto: "FALDA TALLA L",
    cantidad: 1,
    fechaEntrega: "04-04-2024",
    comprador: "Eliana Roa",
    telefono: "993018402",
    montoTotal: "S/0.00",
    metodoPago: "No tiene",
    modoEntrega: "solo Entregar",
    distrito: "Santiago de Surco",
    estado: "entregado",
    delivery: "S/13.00",
    dniMoto: "No tiene",
    motorizado: "No tiene",
    placa: "No tiene",
    motivo: "No tiene"
  },
];

export default function ShipmentsPage() {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filterField, setFilterField] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({ from: undefined, to: undefined });

  const handleOpenModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
  };

  const handleCloseModal = () => {
    setSelectedShipment(null);
  };

  // Filter Logic (Simple implementation for mock)
  const filteredShipments = MOCK_SHIPMENTS.filter(item => {
    // Basic search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return (
        item.vendedor.toLowerCase().includes(searchLower) ||
        item.comprador.toLowerCase().includes(searchLower) ||
        item.producto.toLowerCase().includes(searchLower)
      );
    }

    // Filter by Date Range (MOCK_SHIPMENTS dates are DD-MM-YYYY)
    if (dateRange.from && item.fechaEntrega) {
      const parts = item.fechaEntrega.split('-');
      if (parts.length === 3) {
        const mDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
        const fDate = new Date(dateRange.from);
        fDate.setHours(0, 0, 0, 0);
        if (mDate < fDate) return false;
      }
    }
    
    if (dateRange.to && item.fechaEntrega) {
      const parts = item.fechaEntrega.split('-');
      if (parts.length === 3) {
        const mDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
        const tDate = new Date(dateRange.to);
        tDate.setHours(23, 59, 59, 999);
        if (mDate > tDate) return false;
      }
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

        {/* Table */}
        <div className="space-y-4">
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
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedShipment}
        onClose={handleCloseModal}
        size="xl"
        title={`Detalle de Envío #${selectedShipment?.id}`}
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
          <div className="flex flex-col gap-4">
            
            {/* Primera Fila: General & Producto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* General Info Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Información General
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Vendedor</p>
                    <p className="font-semibold text-gray-900 truncate" title={selectedShipment.vendedor}>{selectedShipment.vendedor}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Comprador</p>
                    <p className="font-semibold text-gray-900 truncate" title={selectedShipment.comprador}>{selectedShipment.comprador}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Teléfono</p>
                    <p className="font-semibold text-gray-900">{selectedShipment.telefono}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Fecha Entrega</p>
                    <p className="font-semibold text-gray-900">{selectedShipment.fechaEntrega}</p>
                  </div>
                </div>
              </div>

              {/* Product Info Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Detalles del Producto
                </h4>
                <div className="flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-1">Producto(s)</p>
                    <p className="font-medium text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs line-clamp-2" title={selectedShipment.producto}>
                      {selectedShipment.producto}
                    </p>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <div>
                      <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Cantidad</p>
                      <p className="font-semibold text-gray-900">{selectedShipment.cantidad}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Monto Total</p>
                      <p className="font-bold text-emerald-600 text-lg leading-none">{selectedShipment.montoTotal}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda Fila: Pago, Entrega & Motorizado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment & Delivery Info Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Pago y Entrega
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Método Pago</p>
                    <p className="font-semibold text-gray-900 truncate" title={selectedShipment.metodoPago}>{selectedShipment.metodoPago}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Modo Entrega</p>
                    <p className="font-semibold text-gray-900 truncate" title={selectedShipment.modoEntrega}>{selectedShipment.modoEntrega}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Costo Delivery</p>
                    <p className="font-semibold text-gray-900">{selectedShipment.delivery}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Distrito</p>
                    <p className="font-semibold text-gray-900 truncate" title={selectedShipment.distrito}>{selectedShipment.distrito}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Estado</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {selectedShipment.estado}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Motivo</p>
                    <p className="font-semibold text-gray-900 truncate" title={selectedShipment.motivo}>{selectedShipment.motivo}</p>
                  </div>
                </div>
              </div>

              {/* Motorizado Info Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Datos del Motorizado
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm flex-1 content-start">
                  <div className="col-span-2">
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Nombre</p>
                    <p className="font-semibold text-gray-900 truncate" title={selectedShipment.motorizado}>{selectedShipment.motorizado}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">DNI</p>
                    <p className="font-semibold text-gray-900">{selectedShipment.dniMoto}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">Placa</p>
                    <p className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 w-fit">{selectedShipment.placa}</p>
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
