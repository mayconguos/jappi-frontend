'use client';

import { useState } from 'react';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, User, Package, CheckCircle2, AlertCircle, MessageCircle, Phone, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CameraCapture from '@/components/ui/camera-capture';

interface PickupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickup: any;
  onStatusChange: (id: string, newStatus: string) => void;
}

export default function PickupDetailModal({ isOpen, onClose, pickup, onStatusChange }: PickupDetailModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showProofScreen, setShowProofScreen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoSlots, setPhotoSlots] = useState(1);
  const [activeCameraSlot, setActiveCameraSlot] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!pickup) return null;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, fieldId }: { text: string; fieldId: string }) => (
    <button
      onClick={() => handleCopy(text, fieldId)}
      className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors ml-1"
      title="Copiar"
    >
      {copiedField === fieldId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );

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
    setActiveCameraSlot(null);
  };

  const handleConfirmPickup = () => {
    if (photos.filter(Boolean).length < 1) return;

    setIsUploading(true);
    setTimeout(() => {
      onStatusChange(pickup.id, 'completed');
      setIsUploading(false);
      setShowProofScreen(false);
      setPhotoSlots(1);
      setPhotos([]);
      onClose();
    }, 2000);
  };

  const isPending = pickup.status === 'pending';
  const isCompleted = pickup.status === 'completed';

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
          showProofScreen ? 'Prueba de Recojo' : (
            <div className="flex flex-col gap-1">
              <span className="leading-tight">Detalle de Recojo</span>
            </div>
          )
        }
        size="lg"
        showCloseButton
      >
        <div>
          {!showProofScreen ? (
            <div className="space-y-2">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sección Remitente */}
                <div className="flex items-start gap-2">
                  <User size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-md font-semibold text-gray-900">
                        {pickup.sender}
                      </h3>
                      <CopyButton text={pickup.sender} fieldId="sender" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-gray-500">{pickup.sender_phone}</p>
                      <div className="flex gap-1.5">
                        <a
                          href={`tel:${pickup.sender_phone.replace(/\D/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-100"
                        >
                          <Phone size={12} className="fill-blue-700/10" />
                          Llamar
                        </a>
                        <a
                          href={`https://wa.me/${pickup.sender_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${pickup.sender}, te saluda el motorizado de Jappi Express. Estoy en camino para recoger tu pedido ${pickup.id} en ${pickup.origin}.`)}`}
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
                  <Package size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">
                      <span className="font-medium">{pickup.items_count}</span> bultos
                    </h3>
                  </div>
                </div>

                {/* Sección Dirección */}
                <div className="flex items-start gap-2">
                  <MapPin size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-md font-semibold text-gray-900 leading-tight">
                        {pickup.origin}
                      </h3>
                      <CopyButton text={pickup.origin} fieldId="origin" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Recojo programado para hoy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3 items-start">
                <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-yellow-800">
                  Agrega al menos 1 foto del paquete/guía para completar el recojo.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: photoSlots }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 relative transition-all overflow-hidden group ${photos[idx]
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 text-gray-400 cursor-pointer'
                      }`}
                    onClick={() => !photos[idx] && handlePhotoClick(idx)}
                  >
                    {photos[idx] ? (
                      <>
                        <img src={photos[idx]} alt={`Foto ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-6 w-6 rounded-full"
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
                      </>
                    ) : (
                      <>
                        <Camera size={28} />
                        <span className="text-xs font-medium">Foto {idx + 1}</span>
                      </>
                    )}
                  </div>
                ))}

                {photoSlots < 3 && photos[photoSlots - 1] && (
                  <div
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => setPhotoSlots(s => s + 1)}
                  >
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-[11px] font-medium text-center">Agregar foto</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ModalFooter className="mt-6 pt-4 border-t border-gray-100">
          {!showProofScreen ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
              {(isPending || !isCompleted) && (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handleFinishClick}>
                  <CheckCircle2 size={16} /> Confirmar Recojo
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setShowProofScreen(false)} disabled={isUploading}>
                Atrás
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleConfirmPickup}
                disabled={photos.filter(Boolean).length < 1 || isUploading}
              >
                {isUploading ? 'Procesando...' : 'Finalizar Recojo'}
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>

      {activeCameraSlot !== null && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setActiveCameraSlot(null)}
        />
      )}
    </>
  );
}
