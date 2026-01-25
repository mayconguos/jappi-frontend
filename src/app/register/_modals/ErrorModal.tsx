import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Lightbulb } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function ErrorModal({ isOpen, onClose, title, message }: ErrorModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      size="sm"
    >
      <div className="flex flex-col items-center text-center py-2 pb-6">
        {/* 1. Iconografía de Impacto */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300">
          <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
        </div>

        {/* 2. Tipografía y Mensaje */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No pudimos completar el registro
        </h3>
        <p className="text-gray-500 leading-relaxed max-w-[90%] mb-6">
          Ocurrió un error inesperado al procesar tus datos. Por favor, inténtalo de nuevo.
        </p>

        {/* Mensaje original técnico (opcional/contextual) */}
        {message && message !== "Error al registrar" && (
          <p className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded mb-6">
            Detalle: {message}
          </p>
        )}

        {/* 3. Caja de Consejo */}
        <Card variant="flat" className="bg-orange-50 border-orange-100 w-full text-left flex gap-3 p-4 mb-6">
          <Lightbulb className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            <strong>Consejo:</strong> Revisa los datos ingresados y vuelve a intentarlo. Si el problema persiste, contacta al soporte.
          </p>
        </Card>

        {/* 4. Botón de Acción */}
        <Button
          variant="primary"
          className="w-full"
          size="lg"
          onClick={onClose}
        >
          Entendido, voy a revisar
        </Button>
      </div>
    </Modal>
  );
}