import { useEffect, useState } from 'react';

import { X, RotateCcw, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useCamera } from '@/hooks/useCamera';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: Readonly<CameraCaptureProps>) {
  const { videoRef, startCamera, stopCamera, takePhoto, error, isStreaming } = useCamera();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    const photo = takePhoto();
    if (photo) {
      setCapturedImage(photo);
      stopCamera(); // Stop stream to save battery while previewing
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const renderMainArea = () => {
    if (error) {
      return (
        <div className="text-white text-center p-6">
          <p className="text-red-400 mb-2 font-medium">Error de Cámara</p>
          <p className="text-sm text-gray-300">{error}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      );
    }

    if (capturedImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={capturedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full"
        >
          <X size={24} />
        </Button>
        {/* Could add flash toggle here later */}
      </div>

      {/* Main Area */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black">
        {renderMainArea()}
      </div>

      {/* Footer / Trigger */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex justify-center items-center gap-10">
        {capturedImage ? (
          <>
            {/* Botón Reintentar - Secundario para el repartidor */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10 transition-all active:scale-90 shadow-xl"
                onClick={handleRetake}
              >
                <RotateCcw size={22} />
              </Button>
              <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Repetir</span>
            </div>

            {/* Botón Aceptar - Primario y Extra Grande para facilitar el toque rápido del repartidor */}
            <div className="flex flex-col items-center gap-2">
              <Button
                size="icon"
                className="h-20 w-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all active:scale-90 border-4 border-emerald-300/30"
                onClick={handleConfirm}
              >
                <Check size={44} strokeWidth={4} />
              </Button>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Confirmar</span>
            </div>
          </>
        ) : (
          /* Botón Disparador Premium */
          <button
            onClick={handleCapture}
            disabled={!isStreaming}
            className="group relative flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tomar foto"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 scale-125 blur-sm group-active:scale-100 transition-transform" />
            <div className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center p-1 shadow-2xl">
              <div className="h-full w-full rounded-full bg-white group-active:scale-90 transition-transform shadow-inner" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
