'use client';

import { useState } from 'react';

import { MapPin, User, CheckCircle2, AlertCircle, MessageCircle, Phone, Copy, Check, Eye, Camera, Navigation } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CameraCapture from '@/components/ui/camera-capture';
import Modal, { ModalFooter } from '@/components/ui/modal';

import { CarrierDelivery, CarrierDeliveryStatus } from '@/types/courier';
import api from '@/app/services/api';

interface DeliveryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: CarrierDelivery | null;
  onStatusChange: (id: string, newStatus: CarrierDeliveryStatus) => void;
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
    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-all active:scale-90 ml-1"
    title="Copiar"
  >
    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
  </button>
);

const getStatusBadge = (status: CarrierDeliveryStatus) => {
  switch (status) {
    case 'delivered':
      return <Badge variant="success" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Enviado</Badge>;
    case 'in_transit':
      return <Badge variant="info" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">En Ruta</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Cancelado</Badge>;
    case 'returned':
      return <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Devuelto</Badge>;
    default:
      return <Badge variant="warning" className="rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">Pendiente</Badge>;
  }
};

export default function DeliveryDetailModal({
  isOpen,
  onClose,
  delivery,
  onStatusChange
}: Readonly<DeliveryDetailModalProps>) {
  const [isUploading, setIsUploading] = useState(false);
  const [showProofScreen, setShowProofScreen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeCameraSlot, setActiveCameraSlot] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!delivery) return null;

  const isFinished = ['delivered', 'cancelled', 'returned'].includes(delivery.status);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePhotoCapture = (imageSrc: string) => {
    if (activeCameraSlot === null) return;
    const newPhotos = [...photos];
    newPhotos[activeCameraSlot] = imageSrc;
    setPhotos(newPhotos);
    setActiveCameraSlot(null);
  };

  const handleConfirmDelivery = async () => {
    const validPhotos = photos.filter(p => p && p !== '');
    if (validPhotos.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < validPhotos.length; i++) {
        const response = await fetch(validPhotos[i]);
        const blob = await response.blob();
        formData.append('photos', blob, `proof_${i}.jpg`);
      }

      await api.post(`/shippings/${delivery.id}/delivered`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onStatusChange(delivery.id, 'delivered');
      onClose();
    } catch (error) {
      console.error('Error al confirmar entrega:', error);
      alert('Hubo un error al subir las fotos. Por favor reintenta.');
    } finally {
      setIsUploading(false);
    }
  };

  const whatsappMessage = isFinished 
    ? `Hola ${delivery.customer_name}, le saluda el motorizado de Japi Express. Ya entregamos su pedido de la tienda *${delivery.company_name}*. Me comunico con usted por...`
    : [
        `Buen día, le saludamos de Japi Express ${String.fromCodePoint(0x1F4E6)}`,
        `Empresa Courier oficial de la tienda *${delivery.company_name}* donde realizó su compra.`,
        '',
        `Le escribo por este medio para me haga llegar su ubicación de mapa ${String.fromCodePoint(0x1F4CD)} y poder realizar la entrega con más efectividad.`,
        '',
        `${String.fromCodePoint(0x1F550)} Estaremos visitándolo(a) el día de hoy hasta las 07:00 pm aprox.`,
        '',
        `${String.fromCodePoint(0x2B50)} ¡Qué tenga un excelente día! ${String.fromCodePoint(0x2B50)}`
      ].join('\n');
  
  const mapsQuery = `${delivery.address}, ${delivery.district_name}, Lima`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

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
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              {showProofScreen ? 'Prueba de Entrega' : 'Detalle de Entrega'}
            </span>
          </div>
        }
        size="lg"
        showCloseButton
      >
        <div className="py-1">
          {showProofScreen ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
                  <Camera size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-950">Captura de Pruebas</p>
                  <p className="text-[11px] text-indigo-700/80 mt-0.5 leading-relaxed">
                    Sube una o dos fotos del paquete entregado para completar el proceso.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((index) => {
                  const hasPhoto = !!photos[index];
                  return hasPhoto ? (
                    <div key={index} className="aspect-square rounded-2xl border-2 border-emerald-500 bg-emerald-50 overflow-hidden relative group shadow-lg shadow-emerald-100">
                      <img src={photos[index]} alt="Prueba" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const newPhotos = [...photos];
                          newPhotos[index] = '';
                          setPhotos(newPhotos);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg active:scale-90 transition-all z-10"
                      >
                        <AlertCircle size={14} className="rotate-45" />
                      </button>
                    </div>
                  ) : (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveCameraSlot(index)}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all active:scale-[0.98] group bg-slate-50/30"
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100">
                        <Camera size={24} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">FOTO {index + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100 space-y-4">
                {/* Cabecera compacta con Estado */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Actual</p>
                  {getStatusBadge(delivery.status)}
                </div>

                {/* Destinatario */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200/50">
                    <User size={20} className="text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                        {delivery.customer_name}
                      </h3>
                      <CopyButton 
                        text={delivery.customer_name} 
                        fieldId="customer" 
                        isCopied={copiedField === 'customer'} 
                        onCopy={handleCopy} 
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{delivery.phone}</p>
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
                        {delivery.address}
                      </h3>
                      <CopyButton 
                        text={delivery.address} 
                        fieldId="address" 
                        isCopied={copiedField === 'address'} 
                        onCopy={handleCopy} 
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">
                      {delivery.district_name} {delivery.sector_name ? `· ${delivery.sector_name}` : ''}
                    </p>
                    {!isFinished && (
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
              </div>

              {/* Botones de Contacto (SIEMPRE VISIBLES para el motorizado) */}
              <div className="grid grid-cols-2 gap-3 px-1">
                <a
                  href={`https://wa.me/51${delivery.phone.replaceAll(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-[11px] border border-emerald-200/50 active:scale-[0.98] transition-all shadow-sm tracking-widest uppercase"
                >
                  <MessageCircle size={20} className="fill-emerald-700/10" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${delivery.phone.replaceAll(/\D/g, '')}`}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black text-[11px] border border-slate-200/50 active:scale-[0.98] transition-all shadow-sm tracking-widest uppercase"
                >
                  <Phone size={20} className="fill-slate-700/10" />
                  Llamar
                </a>
              </div>

              {/* Sección de Pruebas (Historial) */}
              {isFinished && delivery.signed_urls && delivery.signed_urls.length > 0 && (
                <div className="px-1 pt-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Eye size={12} /> Fotos de Entrega
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {delivery.signed_urls.map((url, idx) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square rounded-2xl overflow-hidden border border-slate-100 relative shadow-md shadow-slate-100"
                      >
                        <img
                          src={url}
                          alt={`Prueba ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ModalFooter className="mt-6 pt-3 px-1 border-t border-slate-100">
          <div className="flex items-center w-full gap-3">
            <Button
              variant="ghost"
              className="px-6 text-slate-500 font-bold hover:bg-slate-50"
              onClick={() => {
                if (showProofScreen) {
                  setShowProofScreen(false);
                  setPhotos([]);
                } else {
                  onClose();
                }
              }}
              disabled={isUploading}
            >
              {showProofScreen ? 'Atrás' : 'Cerrar'}
            </Button>

            {!isFinished && (
              showProofScreen ? (
                <Button
                  className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white gap-3 rounded-2xl font-black shadow-xl shadow-emerald-200 active:scale-95 transition-all text-xs tracking-widest"
                  onClick={handleConfirmDelivery}
                  disabled={photos.filter(p => p !== '').length === 0 || isUploading}
                >
                  {isUploading ? (
                    'PROCESANDO...'
                  ) : (
                    <>
                      <CheckCircle2 size={24} />
                      CONFIRMAR
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white gap-3 rounded-2xl font-black shadow-xl shadow-indigo-200 active:scale-95 transition-all text-xs tracking-widest"
                  onClick={() => {
                    setPhotos(['', '']); 
                    setShowProofScreen(true);
                  }}
                >
                  <CheckCircle2 size={24} />
                  FINALIZAR ENTREGA
                </Button>
              )
            )}
          </div>
        </ModalFooter>
      </Modal>

      {activeCameraSlot !== null && (
        <CameraCapture
          onClose={() => setActiveCameraSlot(null)}
          onCapture={handlePhotoCapture}
        />
      )}
    </>
  );
}
