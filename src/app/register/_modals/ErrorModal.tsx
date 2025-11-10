'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';

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
      title={title}
      description="Se encontró un problema durante el registro"
      size="sm"
    >
      <div className="py-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-xs">
            💡 <strong>Consejo:</strong> Revisa los datos ingresados y vuelve a intentarlo. Si el problema persiste, contacta al soporte.
          </p>
        </div>
      </div>
      <ModalFooter className="py-3">
        <Button
          variant="outline"
          onClick={onClose}
          size="sm"
          className="flex-1"
        >
          Entendido
        </Button>
      </ModalFooter>
    </Modal>
  );
}