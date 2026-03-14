
import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      // Preferencia por la cámara trasera ('environment')
      // fallback a cualquier cámara si no hay trasera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsStreaming(true);
      setError(null);
    } catch (err: any) {
      console.error(err);
      // Manejo básico de errores
      if (err.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Por favor, habilite el acceso.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en este dispositivo.');
      } else {
        setError('Error al acceder a la cámara.');
      }
      setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  const takePhoto = useCallback((): string | null => {
    if (!videoRef.current || !stream) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    // Usar las dimensiones reales del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dibujar el frame actual
    ctx.drawImage(video, 0, 0);

    // Retornar imagen comprimida (JPEG 0.8)
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [stream]);

  return { videoRef, startCamera, stopCamera, takePhoto, error, isStreaming };
};
