'use client';

import { useState } from 'react';

import { MapPin, User, Package, CheckCircle2, MessageCircle, Phone, Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';

interface PickupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickup: any;
  onStatusChange: (id: string, newStatus: string) => void;
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

export default function PickupDetailModal({ isOpen, onClose, pickup, onStatusChange }: Readonly<PickupDetailModalProps>) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!pickup) return null;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    // Simulación de proceso de confirmación
    await new Promise(resolve => setTimeout(resolve, 1000));
    onStatusChange(pickup.id, 'picked_up');
    setIsConfirming(false);
    onClose();
  };

  const whatsappMessage = `Hola ${pickup.sender}, te saluda el motorizado de Jappi Express. Estoy en camino para recoger tu pedido ${pickup.id} en ${pickup.origin}.`;

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
            <User size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center">
                <h3 className="text-md font-semibold text-gray-900">
                  {pickup.sender}
                </h3>
                <CopyButton 
                  text={pickup.sender} 
                  fieldId="sender" 
                  isCopied={copiedField === 'sender'} 
                  onCopy={handleCopy} 
                />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500">{pickup.sender_phone}</p>
                <div className="flex gap-1.5">
                  <a
                    href={`tel:${pickup.sender_phone.replaceAll(/\D/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-100"
                  >
                    <Phone size={12} className="fill-blue-700/10" />
                    Llamar
                  </a>
                  <a
                    href={`https://wa.me/51${pickup.sender_phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-medium border border-emerald-100"
                  >
                    <MessageCircle size={12} className="fill-emerald-700/10" />
                    Chat
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Bultos */}
          <div className="flex items-start gap-3">
            <Package size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Carga</h3>
              <h3 className="text-md font-semibold text-gray-900">
                <span className="font-medium">{pickup.items_count}</span> bultos
              </h3>
            </div>
          </div>

          {/* Sección Dirección */}
          <div className="flex items-start gap-3 md:col-span-2">
            <MapPin size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-md font-semibold text-gray-900 leading-tight">
                  {pickup.origin}
                </h3>
                <CopyButton 
                  text={pickup.origin} 
                  fieldId="origin" 
                  isCopied={copiedField === 'origin'} 
                  onCopy={handleCopy} 
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recojo programado para hoy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ModalFooter className="mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
          Cerrar
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          <CheckCircle2 size={16} />
          {isConfirming ? 'Confirmando...' : 'Confirmar Recojo'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
