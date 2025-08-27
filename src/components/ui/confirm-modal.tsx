'use client';

import { Button } from './button';
import { ModalFooter } from './modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  context?: {
    name?: string;
    email?: string;
    identifier?: string;
  };
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '', // Asegurar que `title` esté definido
  message = '¿Está seguro de que desea continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant,
  context
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'confirm-modal-title' : undefined}
      aria-describedby={message ? 'confirm-modal-description' : undefined}
    >
      {/* Overlay/Backdrop */}
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="
        relative bg-white rounded-lg border border-gray-300 shadow-2xl max-h-[90vh] overflow-hidden
        w-full mx-4 transition-all duration-300 transform max-w-md
      ">
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between p-4 border-b border-gray-200">
            <h2
              id="confirm-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </h2>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          <p id="confirm-modal-description" className="text-sm text-gray-600">
            {message}
          </p>
          {context && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              {context.name && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Nombre:</span> {context.name}
                </p>
              )}
              {context.email && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Correo:</span> {context.email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter className="p-4 border-t border-gray-200">
          { variant !== 'info' && (
            <Button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className="bg-primary text-white disabled:opacity-50"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </div>
    </div>
  );
}
