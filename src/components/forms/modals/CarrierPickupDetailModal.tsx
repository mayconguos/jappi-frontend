'use client';

import { useState } from 'react';

import { MapPin, User, CheckCircle2, MessageCircle, Phone, Copy, Check, Navigation, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { CarrierPickup, CarrierPickupStatus } from '@/app/dashboard/carrier/pickups/page';

interface CarrierPickupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickup: CarrierPickup | null;
  isConfirming: boolean;
  onConfirmPickup: (id: number) => Promise<void>;
}

interface CopyButtonProps {
  text: string;
  fieldId: string;
  isCopied: boolean;
  onCopy: (text: string, fieldId: string) => void;
}

const getStatusBadge = (status: CarrierPickupStatus) => {
  switch (status) {
    case 'pending': return <Badge variant="warning" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Por recoger</Badge>;
    case 'scheduled': return <Badge variant="info" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Programado</Badge>;
    case 'picked_up': return <Badge variant="success" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Recogido</Badge>;
    case 'received': return <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Recibido</Badge>;
    default: return <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Desconocido</Badge>;
  }
};

const CopyButton = ({ text, fieldId, isCopied, onCopy }: Readonly<CopyButtonProps>) => (
  <button
    onClick={() => onCopy(text, fieldId)}
    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-all active:scale-90 ml-1"
    title="Copiar"
  >
    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
  </button>
);

export default function CarrierPickupDetailModal({
  isOpen,
  onClose,
  pickup,
  isConfirming,
  onConfirmPickup
}: Readonly<CarrierPickupDetailModalProps>) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!pickup) return null;

  const isPending = pickup.status === 'pending' || pickup.status === 'scheduled';

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const whatsappMessage = [
    `Buen día, le saludamos de Japi Express ${String.fromCodePoint(0x1F4E6)}.`,
    `Somos el Courier encargado de sus despachos de hoy.`,
    '',
    `Le escribo para confirmarle que estoy en camino a su local *${pickup.company_name}* para realizar el recojo de sus pedidos.`,
    '',
    `${String.fromCodePoint(0x1F4CD)} Dirección: ${pickup.address}`,
    '',
    `${String.fromCodePoint(0x2B50)} ¡Qué tenga un excelente día! ${String.fromCodePoint(0x2B50)}`
  ].join('\n');

  const mapsQuery = `${pickup.address}, ${pickup.district_name}, Lima`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Detalle de Recojo</span>
        </div>
      }
      size="lg"
      showCloseButton
    >
      <div className="py-1 space-y-4">
        {/* Card Principal de Información */}
        <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100 space-y-4">
          {/* Cabecera compacta con Estado */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado del Recojo</p>
            {getStatusBadge(pickup.status)}
          </div>

          {/* Remitente/Empresa */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200/50">
              <User size={20} className="text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                  {pickup.company_name}
                </h3>
                <CopyButton 
                  text={pickup.company_name} 
                  fieldId="sender" 
                  isCopied={copiedField === 'sender'} 
                  onCopy={handleCopy} 
                />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] font-bold text-slate-500">{pickup.phone}</p>
                <span className="text-slate-300">·</span>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight bg-indigo-50 px-2 rounded-full border border-indigo-100/50">
                  {pickup.origin}
                </p>
              </div>
            </div>
          </div>

          {/* Dirección y Mapa */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200/50">
              <MapPin size={20} className="text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {pickup.address}
                </h3>
                <CopyButton 
                  text={pickup.address} 
                  fieldId="address" 
                  isCopied={copiedField === 'address'} 
                  onCopy={handleCopy} 
                />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">
                {pickup.district_name} {pickup.sector_name ? `· ${pickup.sector_name}` : ''}
              </p>
              {isPending && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex h-10 px-4 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white text-[11px] font-black shadow-lg shadow-blue-100 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <Navigation size={16} className="fill-white/20" />
                  ABRIR EN MAPAS
                </a>
              )}
            </div>
          </div>

          {/* Fecha Programada */}
          <div className="flex items-center gap-4 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/50">
              <Calendar size={20} className="text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Programación</p>
              <p className="text-sm font-bold text-slate-900">{pickup.pickup_date}</p>
            </div>
          </div>
        </div>

        {/* Botones de Contacto (Driver Focused) */}
        <div className="grid grid-cols-2 gap-3 px-1">
          <a
            href={`https://wa.me/51${pickup.phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-[11px] border border-emerald-200/50 active:scale-[0.98] transition-all shadow-sm tracking-widest uppercase"
          >
            <MessageCircle size={20} className="fill-emerald-700/10" />
            WhatsApp
          </a>
          <a
            href={`tel:${pickup.phone.replaceAll(/\D/g, '')}`}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black text-[11px] border border-slate-200/50 active:scale-[0.98] transition-all shadow-sm tracking-widest uppercase"
          >
            <Phone size={20} className="fill-slate-700/10" />
            Llamar
          </a>
        </div>
      </div>

      <ModalFooter className="mt-6 pt-3 px-1 border-t border-slate-100">
        <div className="flex items-center w-full gap-3">
          <Button
            variant="ghost"
            className="px-6 text-slate-500 font-bold hover:bg-slate-50"
            onClick={onClose}
            disabled={isConfirming}
          >
            Cerrar
          </Button>

          {isPending && (
            <Button
              className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white gap-3 rounded-2xl font-black shadow-xl shadow-indigo-200 active:scale-95 transition-all text-xs tracking-widest"
              onClick={() => onConfirmPickup(pickup.id)}
              disabled={isConfirming}
            >
              {isConfirming ? (
                'PROCESANDO...'
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  CONFIRMAR RECOJO
                </>
              )}
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
