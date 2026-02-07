import { useEffect, useState } from 'react';
import { useCamera } from '@/hooks/use-camera';
import { Button } from '@/components/ui/button';
import { X, Camera as CameraIcon, RotateCcw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
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
        {error ? (
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
        ) : capturedImage ? (
          // Preview Mode
          <div className="w-full h-full flex items-center justify-center bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capturedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          // Viewfinder Mode
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Footer / Trigger */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-8">
        {capturedImage ? (
          <>
            <Button
              variant="secondary"
              size="lg"
              className="h-14 w-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 border border-gray-500"
              onClick={handleRetake}
            >
              <RotateCcw size={24} />
            </Button>
            <Button
              size="lg"
              className="h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
              onClick={handleConfirm}
            >
              <Check size={32} />
            </Button>
          </>
        ) : (
          <button
            onClick={handleCapture}
            disabled={!isStreaming}
            className="h-16 w-16 rounded-full bg-white border-4 border-gray-300 ring-4 ring-white/30 active:scale-95 transition-all shadow-lg shadow-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tomar foto"
          />
        )}
      </div>
    </div>
  );
}
