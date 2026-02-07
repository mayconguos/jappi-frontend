'use client';

import { useState } from 'react';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, User, Package, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CameraCapture from '@/components/ui/camera-capture';

interface DeliveryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: any; // Using any for mock simplicity, ideally defined type
  onStatusChange: (id: string, newStatus: string) => void;
}

export default function DeliveryDetailModal({ isOpen, onClose, delivery, onStatusChange }: DeliveryDetailModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showProofScreen, setShowProofScreen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeCameraSlot, setActiveCameraSlot] = useState<number | null>(null);

  if (!delivery) return null;

  const handleStartRoute = () => {
    onStatusChange(delivery.id, 'in_progress');
    onClose();
  };

  const handleFinishClick = () => {
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

  const handleConfirmDelivery = () => {
    if (photos.filter(Boolean).length < 3) return;

    setIsUploading(true);
    // Simulate API call
    setTimeout(() => {
      onStatusChange(delivery.id, 'completed');
      setIsUploading(false);
      setShowProofScreen(false);
      setPhotos([]);
      onClose();
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Entregado</Badge>;
      case 'in_progress': return <Badge variant="info">En Ruta</Badge>;
      case 'failed': return <Badge variant="destructive">Fallido</Badge>;
      default: return <Badge variant="warning">Pendiente</Badge>;
    }
  };

  const isPending = delivery.status === 'pending';
  const isInProgress = delivery.status === 'in_progress';
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
              <span className="font-mono text-sm font-normal text-gray-500">{delivery.id}</span>
            </div>
          )
        }
        size="lg"
        showCloseButton
      >
        <div className="min-h-[300px]">
          {!showProofScreen ? (
            <div className="space-y-6">
              {/* Header Status */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Estado Actual:</span>
                <div>{getStatusBadge(delivery.status)}</div>
              </div>

              {/* Recipient Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> Datos del Destinatario
                  </h3>
                  <div className="pl-6 space-y-1">
                    <p className="font-medium text-gray-900">{delivery.recipient}</p>
                    <p className="text-sm text-gray-500">DNI: 45829102</p>
                    <p className="text-sm text-gray-500">Tel: +51 999 888 777</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={16} className="text-blue-600" /> Detalles del Paquete
                  </h3>
                  <div className="pl-6 space-y-1">
                    <p className="text-sm text-gray-700"><span className="font-medium">{delivery.items_count}</span> bultos</p>
                    <p className="text-sm text-gray-500">Peso: 2.5 kg</p>
                    <p className="text-sm text-gray-500">Tipo: Electrónicos</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Dirección de Entrega
                </h3>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                  <MapPin className="text-blue-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-blue-900">{delivery.recipient_address}</p>
                    <p className="text-xs text-blue-600 mt-0.5">Referencia: Frente al parque central, puerta de rejas negras.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-yellow-800">
                  Para finalizar la entrega, es obligatorio subir 3 evidencias fotográficas. Asegúrate de que sean claras.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className={`
                            aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 relative transition-all overflow-hidden group
                            ${photos[idx]
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 text-gray-400 cursor-pointer'
                      }
                        `}
                    onClick={() => !photos[idx] && handlePhotoClick(idx)}
                  >
                    {photos[idx] ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photos[idx]} alt="Evidence" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-6 w-6 rounded-full opacity-100 hover:scale-110 transition-transform shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newPhotos = [...photos];
                              newPhotos[idx] = '';
                              setPhotos(newPhotos);
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
                        <Camera size={32} />
                        <span className="text-xs font-medium text-center px-4">
                          {idx === 0 ? 'Fachada' : idx === 1 ? 'Paquete' : 'Recibido'}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-gray-500">
                Toca cada recuadro para tomar foto
              </p>
            </div>
          )}
        </div>

        <ModalFooter className="mt-6 pt-4 border-t border-gray-100">
          {!showProofScreen ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
              {isPending && (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleStartRoute}>
                  <Navigation size={16} /> Iniciar Ruta
                </Button>
              )}
              {isInProgress && (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handleFinishClick}>
                  <CheckCircle2 size={16} /> Finalizar Entrega
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
                onClick={handleConfirmDelivery}
                disabled={photos.filter(Boolean).length < 3 || isUploading}
              >
                {isUploading ? 'Subiendo...' : 'Confirmar Entrega'}
              </Button>
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
