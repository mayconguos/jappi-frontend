'use client';

import { useState } from 'react';

import { MapPin, User, Package, CheckCircle2, MessageCircle, Phone, Copy, Check, Navigation, Calendar } from 'lucide-react';

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

const CopyButton = ({ text, fieldId, isCopied, onCopy }: Readonly<CopyButtonProps>) => (
  <button
    onClick={() => onCopy(text, fieldId)}
    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors ml-1"
    title="Copiar"
  >
    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
  </button>
);

const getStatusBadge = (status: CarrierPickupStatus) => {
  switch (status) {
    case 'pending': return <Badge variant="warning">Por recoger</Badge>;
    case 'scheduled': return <Badge variant="info">Programado</Badge>;
    case 'picked_up': return <Badge variant="success">Recogido</Badge>;
    case 'received': return <Badge variant="outline">Recibido</Badge>;
    default: return <Badge variant="outline">Desconocido</Badge>;
  }
};

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

  const whatsappMessage = `Hola, soy el motorizado de Jappi Express. Estoy en camino para recoger tu pedido en ${pickup.address}, ${pickup.district_name}.`;
  const mapsQuery = `${pickup.address}, ${pickup.district_name}, Lima`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col gap-1">
          <span className="leading-tight">Detalle de Recojo</span>
        </div>
      }
      size="lg"
      showCloseButton
    >
      <div className="space-y-6 py-2">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sección Remitente */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
              <User size={20} className="text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-md font-semibold text-gray-900 leading-tight">
                  {pickup.company_name}
                </h3>
                <button
                  onClick={() => handleCopy(pickup.company_name, 'sender')}
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors ml-1"
                >
                  {copiedField === 'sender' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                {pickup.origin}
              </p>
            </div>
          </div>

          {/* Sección Estado */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
              <Package size={20} className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Estado actual</h3>
              {getStatusBadge(pickup.status)}
            </div>
          </div>

          {/* Sección Dirección */}
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-md font-semibold text-gray-900 leading-tight">
                  {pickup.address}
                </h3>
                <CopyButton
                  text={pickup.address}
                  fieldId="address"
                  isCopied={copiedField === 'address'}
                  onCopy={handleCopy}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500">
                  {pickup.district_name}{pickup.sector_name ? ` · ${pickup.sector_name}` : ''}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 px-3 items-center gap-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Navigation size={12} className="fill-white/20" />
                  VER MAPA
                </a>
              </div>
            </div>
          </div>

          {/* Sección Fecha */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
              <Calendar size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Fecha de recojo</h3>
              <p className="text-sm font-semibold text-gray-900">{pickup.pickup_date}</p>
            </div>
          </div>
        </div>

        {/* Botones de Contacto (Estilo Japi Premium) */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href={`https://wa.me/51${pickup.phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-[0.98] shadow-sm"
          >
            <MessageCircle size={18} className="fill-emerald-700/10" />
            WHATSAPP
          </a>
          <a
            href={`tel:${pickup.phone.replaceAll(/\D/g, '')}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-all active:scale-[0.98] shadow-sm"
          >
            <Phone size={18} className="fill-blue-700/10" />
            LLAMAR
          </a>
        </div>
      </div>

      <ModalFooter className="mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
          Cerrar
        </Button>
        {isPending && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8 rounded-xl font-bold shadow-lg shadow-emerald-100"
            onClick={() => onConfirmPickup(pickup.id)}
            disabled={isConfirming}
          >
            <CheckCircle2 size={18} />
            {isConfirming ? 'PROCESANDO...' : 'CONFIRMAR RECOJO'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
