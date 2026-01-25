'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Download } from 'lucide-react';
import Modal, { ModalFooter } from '@/components/ui/modal';

interface Shipment {
  id: number;
  vendedor: string;
  producto: string;
  cantidad: number;
  fechaEntrega: string;
  comprador: string;
  telefono: string;
  montoTotal: string;
  metodoPago: string;
  modoEntrega: string;
  distrito: string;
  estado: string;
  delivery: string;
  dniMoto: string;
  motorizado: string;
  placa: string;
  motivo: string;
}

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

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto min-h-screen">

      {/* Filters & Actions Section (Matching WorkersFilter Style) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32" />
        </div>

        <div className="flex flex-col lg:flex-row items-end gap-6 relative z-10 w-full">
          {/* Group 1: Date & Consultar */}
          <div className="flex flex-row items-end gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-48">
              <Input
                label="Fecha"
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <Button className="bg-[#1a938e] hover:bg-[#157874] text-white shadow-lg shadow-emerald-100 whitespace-nowrap px-6">
              Consultar
            </Button>
          </div>

          {/* Group 2: Filter & Search */}
          <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:flex-1">
            <div className="w-full sm:w-56">
              <Select
                label="Filtrar por"
                value={filterField}
                onChange={setFilterField}
                options={[
                  { label: 'Vendedor', value: 'vendor' },
                  { label: 'Producto', value: 'product' },
                  { label: 'Comprador', value: 'buyer' },
                ]}
                placeholder="Seleccionar campo"
                icon={Filter}
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex-1 w-full relative group">
              <Input
                label="Búsqueda"
                placeholder="Buscar..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                icon={Search}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* Group 3: Exportar */}
          <div className="w-full lg:w-auto pt-2 lg:pt-0">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm"
            >
              <Download size={18} className="mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-200">
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap w-16">N°</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap">Vendedor</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap">Producto</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap text-center">Cant</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap">Fecha Entrega</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap">Estado</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap">Monto</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap">Modo Entrega</TableHead>
                <TableHead className="text-[#1a938e] font-bold text-xs uppercase tracking-wider whitespace-nowrap text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SHIPMENTS.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50 transition-colors text-xs text-slate-600">
                  <TableCell className="font-bold text-slate-900">#{row.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{row.vendedor}</TableCell>
                  <TableCell className="max-w-[250px] truncate" title={row.producto}>{row.producto}</TableCell>
                  <TableCell className="text-center font-medium">{row.cantidad}</TableCell>
                  <TableCell>{row.fechaEntrega}</TableCell>
                  <TableCell>
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-emerald-200/50">
                      {row.estado}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">{row.montoTotal}</TableCell>
                  <TableCell>{row.modoEntrega}</TableCell>
                  <TableCell className="text-right pr-4">
                    <button
                      onClick={() => handleOpenModal(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100/50 hover:scale-110 active:scale-95 mx-auto"
                      title="Ver detalles completos"
                    >
                      <Eye size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            <Button onClick={handleCloseModal} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
              Cerrar
            </Button>
            <Button className="bg-[#1a938e] text-white hover:bg-[#157874]">
              Imprimir Etiqueta
            </Button>
          </ModalFooter>
        }
      >
        {selectedShipment && (
          <div className="space-y-6">
            {/* General Info Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Información General</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Vendedor</p>
                  <p className="font-medium text-slate-900">{selectedShipment.vendedor}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Comprador</p>
                  <p className="font-medium text-slate-900">{selectedShipment.comprador}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Teléfono</p>
                  <p className="font-medium text-slate-900">{selectedShipment.telefono}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Fecha de Entrega</p>
                  <p className="font-medium text-slate-900">{selectedShipment.fechaEntrega}</p>
                </div>
              </div>
            </div>

            {/* Product Info Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Detalles del Producto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2">
                  <p className="text-slate-500 text-xs">Producto(s)</p>
                  <p className="font-medium text-slate-900 bg-white p-2 rounded border border-slate-100 mt-1">{selectedShipment.producto}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Cantidad</p>
                  <p className="font-medium text-slate-900">{selectedShipment.cantidad}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Monto Total</p>
                  <p className="font-bold text-emerald-600 text-lg">{selectedShipment.montoTotal}</p>
                </div>
              </div>
            </div>

            {/* Payment & Delivery Info Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Pago y Entrega</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Método de Pago</p>
                  <p className="font-medium text-slate-900">{selectedShipment.metodoPago}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Modo de Entrega</p>
                  <p className="font-medium text-slate-900">{selectedShipment.modoEntrega}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Costo Delivery</p>
                  <p className="font-medium text-slate-900">{selectedShipment.delivery}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Distrito</p>
                  <p className="font-medium text-slate-900">{selectedShipment.distrito}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Estado</p>
                  <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold mt-1">
                    {selectedShipment.estado}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Motivo</p>
                  <p className="font-medium text-slate-900">{selectedShipment.motivo}</p>
                </div>
              </div>
            </div>

            {/* Motorizado Info Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Datos del Motorizado</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Nombre</p>
                  <p className="font-medium text-slate-900">{selectedShipment.motorizado}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">DNI</p>
                  <p className="font-medium text-slate-900">{selectedShipment.dniMoto}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Placa</p>
                  <p className="font-medium text-slate-900 uppercase bg-yellow-100 px-2 py-0.5 rounded w-fit text-yellow-800 border-yellow-200 border">{selectedShipment.placa}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
