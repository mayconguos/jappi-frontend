'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';

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
  const [dateValue, setDateValue] = useState('');

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
    return true;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      <div className="space-y-6">
        {/* Filters */}
        <ShipmentsFilter
          filterField={filterField}
          setFilterField={setFilterField}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          dateValue={dateValue}
          setDateValue={setDateValue}
          onConsult={() => { }}
          onExport={() => { }}
          totalItems={filteredShipments.length}
        />

        {/* Table */}
        <div className="space-y-4">
          <ShipmentsTable
            shipments={filteredShipments}
            onView={handleOpenModal}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedShipment}
        onClose={handleCloseModal}
        size="lg"
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
          <div className="space-y-6">
            {/* General Info Card */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Información General</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Vendedor</p>
                  <p className="font-medium text-gray-900">{selectedShipment.vendedor}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Comprador</p>
                  <p className="font-medium text-gray-900">{selectedShipment.comprador}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900">{selectedShipment.telefono}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Fecha de Entrega</p>
                  <p className="font-medium text-gray-900">{selectedShipment.fechaEntrega}</p>
                </div>
              </div>
            </div>

            {/* Product Info Card */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Detalles del Producto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-xs mb-1">Producto(s)</p>
                  <p className="font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200">{selectedShipment.producto}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Cantidad</p>
                  <p className="font-medium text-gray-900">{selectedShipment.cantidad}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Monto Total</p>
                  <p className="font-bold text-emerald-600 text-lg">{selectedShipment.montoTotal}</p>
                </div>
              </div>
            </div>

            {/* Payment & Delivery Info Card */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Pago y Entrega</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Método de Pago</p>
                  <p className="font-medium text-gray-900">{selectedShipment.metodoPago}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Modo de Entrega</p>
                  <p className="font-medium text-gray-900">{selectedShipment.modoEntrega}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Costo Delivery</p>
                  <p className="font-medium text-gray-900">{selectedShipment.delivery}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Distrito</p>
                  <p className="font-medium text-gray-900">{selectedShipment.distrito}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Estado</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    {selectedShipment.estado}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Motivo</p>
                  <p className="font-medium text-gray-900">{selectedShipment.motivo}</p>
                </div>
              </div>
            </div>

            {/* Motorizado Info Card */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Datos del Motorizado</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Nombre</p>
                  <p className="font-medium text-gray-900">{selectedShipment.motorizado}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">DNI</p>
                  <p className="font-medium text-gray-900">{selectedShipment.dniMoto}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Placa</p>
                  <p className="font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-200 w-fit">{selectedShipment.placa}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
