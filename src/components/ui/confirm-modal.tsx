'use client';

import { Button } from './button';

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
  message = '¿Está seguro de que desea continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  context
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'destructive';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-4">
          <p className="text-gray-600">{message}</p>
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

        <div className="flex gap-2 justify-end p-4 border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
