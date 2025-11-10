'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnOverlayClick={false}
      title="¡Registro Exitoso!"
      description="Tu solicitud ha sido recibida correctamente"
      size="md"
    >
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">¡Bienvenido(a) a Jappi Express! 🎉</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Estamos verificando tus datos para activar tu cuenta. Te notificaremos por correo electrónico cuando el proceso esté completo.
        </p>
      </div>
      <ModalFooter className="py-3 flex justify-center space-x-2">
        <Button onClick={handleGoToLogin}>
          Entendido
        </Button>
      </ModalFooter>
    </Modal>
  );
}