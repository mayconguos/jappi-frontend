'use client';

import { useState } from 'react';

import { Camera, MapPin, User, Package, CheckCircle2, AlertCircle, MessageCircle, Phone, Copy, Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CameraCapture from '@/components/ui/camera-capture';
import Modal, { ModalFooter } from '@/components/ui/modal';

import api from '@/app/services/api';

import { CarrierDelivery } from '@/app/dashboard/carrier/deliveries/page';

interface DeliveryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: CarrierDelivery | null;
  onStatusChange: (id: string, newStatus: string) => void;
}

interface CopyButtonProps {
  text: string;
  fieldId: string;
  onCopy: (text: string, fieldId: string) => void;
  isCopied: boolean;
}

const CopyButton = ({ text, fieldId, onCopy, isCopied }: CopyButtonProps) => (
  <button
    onClick={() => onCopy(text, fieldId)}
    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors ml-1"
    title="Copiar"
  >
    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
  </button>
);

const getStatusBadge = (status: string) => {
  if (status === 'completed') {
    return <Badge variant="success">Entregado</Badge>;
  }
  return <Badge variant="info">En Ruta</Badge>;
};

export default function DeliveryDetailModal({ isOpen, onClose, delivery, onStatusChange }: Readonly<DeliveryDetailModalProps>) {
  const [isUploading, setIsUploading] = useState(false);
  const [showProofScreen, setShowProofScreen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoSlots, setPhotoSlots] = useState(1);
  const [activeCameraSlot, setActiveCameraSlot] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!delivery) return null;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };


  const handleFinishClick = () => {
    setPhotoSlots(1);
    setPhotos([]);
    setShowProofScreen(true);
  };

  const handlePhotoClick = (index: number) => {
    setActiveCameraSlot(index);
  };

  const handlePhotoCapture = (imageSrc: string) => {
    if (activeCameraSlot === null) return;

    const newPhotos = [...photos];
    newPhotos[activeCameraSlot] = imageSrc;
    setPhotos(newPhotos);
    setActiveCameraSlot(null); // Close camera
  };

  const handleConfirmDelivery = async () => {
    const validPhotos = photos.filter(Boolean);
    if (validPhotos.length < 1) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // Convertir base64 a Blobs/Files
      for (let i = 0; i < validPhotos.length; i++) {
        const response = await fetch(validPhotos[i]);
        const blob = await response.blob();
        formData.append('files', blob, `photo_${i}.jpg`);
      }

      await api.post(`/courier/upload?id_shipping=${delivery.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onStatusChange(delivery.id, 'completed');
      setShowProofScreen(false);
      setPhotoSlots(1);
      setPhotos([]);
      onClose();
    } catch (error) {
      console.error('Error uploading proof:', error);
      // Aquí podrías mostrar un toast de error si tuvieras uno disponible
    } finally {
      setIsUploading(false);
    }
  };


  const isPending = delivery.status === 'pending' || delivery.status === 'scheduled';
  const isCompleted = delivery.status === 'completed';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setShowProofScreen(false);
          setPhotos([]);
          onClose();
        }}
        title={
          showProofScreen ? 'Prueba de Entrega' : (
            <div className="flex flex-col gap-1">
              <span className="leading-tight">Detalle de Entrega</span>
            </div>
          )
        }
        size="lg"
        showCloseButton
      >
        <div>
          {showProofScreen ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3 items-start">
                <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-yellow-800">
                  Agrega al menos 1 foto clara para completar la entrega.
                </p>
              </div>

              {/* Slots dinámicos */}
              <div className="grid grid-cols-3 gap-3">
                {['slot-0', 'slot-1', 'slot-2'].slice(0, photoSlots).map((slotId, idx) => {
                  const hasPhoto = !!photos[idx];
                  const slotClass = `aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 relative transition-all overflow-hidden group ${hasPhoto
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 text-gray-400 cursor-pointer'
                    }`;

                  if (hasPhoto) {
                    return (
                      <div key={slotId} className={slotClass}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photos[idx]} alt={`Foto ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-6 w-6 rounded-full hover:scale-110 transition-transform shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = [...photos];
                              next[idx] = '';
                              setPhotos(next);
                            }}
                          >
                            <span className="text-xs">×</span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded-full absolute bottom-2 z-10 backdrop-blur-sm">
                          <MapPin size={10} className="text-emerald-400" />
                          <span className="text-[10px] font-mono">GPS OK</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slotId}
                      type="button"
                      className={slotClass}
                      onClick={() => handlePhotoClick(idx)}
                      aria-label={`Tomar foto ${idx + 1}`}
                    >
                      <Camera size={28} />
                      <span className="text-xs font-medium">Foto {idx + 1}</span>
                    </button>
                  );
                })}

                {/* Botón agregar foto */}
                {photoSlots < 3 && photos[photoSlots - 1] && (
                  <button
                    type="button"
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => setPhotoSlots(s => s + 1)}
                  >
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-[11px] font-medium text-center">Agregar foto</span>
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-gray-400">
                Toca cada recuadro para tomar la foto
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Recipient Info */}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Sección Usuario */}
                <div className="flex items-start gap-2">
                  <User size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-md font-semibold text-gray-900">
                        {delivery.recipient}
                      </h3>
                      <CopyButton
                        text={delivery.recipient}
                        fieldId="recipient"
                        onCopy={handleCopy}
                        isCopied={copiedField === 'recipient'}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-gray-500">{delivery.recipient_phone}</p>
                      <div className="flex gap-1.5">
                        <a
                          href={`tel:${delivery.recipient_phone.replaceAll(/\D/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-100"
                        >
                          <Phone size={12} className="fill-blue-700/10" />
                          Llamar
                        </a>
                        <a
                          href={`https://wa.me/${delivery.recipient_phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent('Hola ' + delivery.recipient + ', te saluda el motorizado de Japi Express. Estoy por entregar tu pedido ' + delivery.id + ' en ' + delivery.recipient_address + '.')}`}
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
                <div className="flex items-start gap-2">
                  <Package size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">
                      <span className="font-medium">{delivery.items_count}</span> bultos
                    </h3>
                  </div>
                </div>

                {/* Sección Dirección */}
                <div className="flex items-start gap-2">
                  <MapPin size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-md font-semibold text-gray-900 leading-tight">
                        {delivery.recipient_address}
                      </h3>
                      <CopyButton
                        text={delivery.recipient_address}
                        fieldId="address"
                        onCopy={handleCopy}
                        isCopied={copiedField === 'address'}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Distrito: {delivery.district}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ModalFooter className="mt-6 pt-4 border-t border-gray-100">
          {showProofScreen ? (
            <>
              <Button variant="ghost" onClick={() => setShowProofScreen(false)} disabled={isUploading}>
                Atrás
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleConfirmDelivery}
                disabled={photos.filter(Boolean).length < 1 || isUploading}
              >
                {isUploading ? 'Subiendo...' : 'Confirmar Entrega'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
              {(isPending || !isCompleted) && (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handleFinishClick}>
                  <CheckCircle2 size={16} /> Finalizar Entrega
                </Button>
              )}
            </>
          )}
        </ModalFooter>
      </Modal>

      {/* Full Screen Camera Overlay */}
      {activeCameraSlot !== null && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setActiveCameraSlot(null)}
        />
      )}
    </>
  );
}
