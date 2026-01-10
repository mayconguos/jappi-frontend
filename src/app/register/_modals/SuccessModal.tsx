'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const router = useRouter();

  const handleGoToLogin = () => {
    onClose();
    router.push('/login');
  };

  const footerContent = (
    <div className="flex justify-center w-full">
      <Button
        onClick={handleGoToLogin}
        className="w-full sm:w-auto min-w-[200px] h-11 text-base shadow-lg shadow-green-500/20"
      >
        Ir al Login
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnOverlayClick={false}
      size="md"
      footer={footerContent}
    >
      <div className="text-center py-6 px-2">
        {/* Animated Icon Container */}
        <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          ¡Registro Exitoso!
        </h3>

        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
          Hemos recibido tu solicitud correctamente. <br />
          Estamos validando tus datos para activar tu cuenta.
        </p>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
          <div className="flex gap-3">
            <span className="text-xl">📧</span>
            <p className="text-sm text-blue-800">
              Te notificaremos por correo cuando tu cuenta sea activada. Podrás ingresar usando el email y contraseña que acabas de registrar.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}