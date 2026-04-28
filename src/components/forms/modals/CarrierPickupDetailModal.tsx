'use client';

import { useState } from 'react';
import { User, Package, MapPin, Phone, MessageCircle, Navigation, CheckCircle2, Copy, Check } from 'lucide-react';

import Modal, { ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { CarrierPickup, CarrierPickupStatus } from '@/app/dashboard/carrier/pickups/page';

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_LABELS: Record<CarrierPickupStatus, string> = {
  pending: 'Por recoger',
  scheduled: 'Programado',
  picked_up: 'Recogido',
  received: 'Recibido',
};

const getStatusBadge = (status: CarrierPickupStatus) => {
  switch (status) {
    case 'pending':   return <Badge variant="warning">{STATUS_LABELS[status]}</Badge>;
    case 'scheduled': return <Badge variant="info">{STATUS_LABELS[status]}</Badge>;
    case 'picked_up': return <Badge variant="success">{STATUS_LABELS[status]}</Badge>;
    default:          return <Badge variant="outline">{STATUS_LABELS[status]}</Badge>;
  }
};

// ─── Componentes Internos ─────────────────────────────────────
interface CopyButtonProps {
  text: string;
  fieldId: string;
  isCopied: boolean;
  onCopy: (text: string, fieldId: string) => void;
}

const CopyButton = ({ text, fieldId, isCopied, onCopy }: CopyButtonProps) => (
  <button
    onClick={() => onCopy(text, fieldId)}
    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors ml-1"
    title="Copiar"
  >
    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
  </button>
);

// ─── Props ────────────────────────────────────────────────────
interface CarrierPickupDetailModalProps {
  isOpen: boolean;
  pickup: CarrierPickup | null;
  isConfirming: boolean;
  onClose: () => void;
  onConfirmPickup: (pickupId: number) => Promise<void>;
}

export default function CarrierPickupDetailModal({
  isOpen,
  pickup,
  isConfirming,
  onClose,
  onConfirmPickup,
}: Readonly<CarrierPickupDetailModalProps>) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!pickup) return null;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };



  const getMapsUrl = () => {
    const query = `${pickup.address}, ${pickup.district_name}, Lima`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getWaText = () => {
    const message = `Hola ${pickup.company_name}, te saluda el motorizado de Jappi Express. Estoy en camino para recoger tu pedido en ${pickup.address}, ${pickup.district_name}.`;
    return encodeURIComponent(message);
  };

  const handleClose = () => {
    setShowConfirm(false);
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirmPickup(pickup.id);
    setShowConfirm(false);
    onClose();
  };

  // ─── Vista de Confirmación ────────────────────────────────
  if (showConfirm) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Confirmar Recojo"
        size="sm"
        showCloseButton
      >
        <div className="py-4 space-y-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">¿Confirmar recojo?</p>
              <p className="text-sm text-gray-500 mt-1">
                Se marcará el recojo de <span className="font-medium text-gray-700">{pickup.company_name}</span> como <span className="font-medium text-emerald-600">Recogido</span>.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-sm text-gray-600 border border-slate-100 space-y-1">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span className="text-xs">{pickup.address}</span>
            </div>
            {pickup.district_name && (
              <div className="flex items-center gap-2">
                <MapPin size={10} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400">{pickup.district_name}</span>
              </div>
            )}
          </div>
        </div>

        <ModalFooter className="pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            <CheckCircle2 size={15} />
            {isConfirming ? 'Confirmando...' : 'Sí, confirmar'}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  // ─── Vista de Detalle ─────────────────────────────────────
  const canConfirm = pickup.status === 'pending' || pickup.status === 'scheduled';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Detalle de Recojo"
      size="lg"
      showCloseButton
    >
      <div className="space-y-6 py-2">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sección Remitente */}
          <div className="flex items-start gap-3">
            <User size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center">
                <h3 className="text-md font-semibold text-gray-900">
                  {pickup.company_name}
                </h3>
                <CopyButton
                  text={pickup.company_name}
                  fieldId="sender"
                  isCopied={copiedField === 'sender'}
                  onCopy={handleCopy}
                />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{pickup.origin}</p>
            </div>
          </div>

          {/* Sección Estado */}
          <div className="flex items-start gap-3">
            <Package size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Estado</h3>
              {getStatusBadge(pickup.status)}
            </div>
          </div>

          {/* Sección Dirección */}
          <div className="flex items-start gap-3 md:col-span-2">
            <MapPin size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-md font-semibold text-gray-900 leading-tight">
                  {pickup.address}
                </h3>
                <CopyButton
                  text={pickup.address}
                  fieldId="origin"
                  isCopied={copiedField === 'origin'}
                  onCopy={handleCopy}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500">
                  {pickup.district_name}{pickup.sector_name ? ` · ${pickup.sector_name}` : ''}
                </p>
                <a
                  href={getMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 px-3 items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-200 transition-colors"
                >
                  <Navigation size={13} className="fill-emerald-700/10" />
                  GOOGLE MAPS
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Contacto (Botones grandes que te gustaron) */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href={`https://wa.me/51${pickup.phone.replaceAll(/\D/g, '')}?text=${getWaText()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <MessageCircle size={18} className="fill-emerald-700/10" />
            WHATSAPP
          </a>
          <a
            href={`tel:${pickup.phone.replaceAll(/\D/g, '')}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Phone size={18} className="fill-blue-700/10" />
            {pickup.phone}
          </a>
        </div>
      </div>

      <ModalFooter className="mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={handleClose}>
          Cerrar
        </Button>
        {canConfirm && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
            onClick={() => setShowConfirm(true)}
          >
            <CheckCircle2 size={16} /> Confirmar Recojo
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
