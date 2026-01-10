'use client';

import React from 'react';

interface ModalProps {
  /**
   * Si el modal está abierto
   */
  isOpen: boolean;
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  /**
   * Título del modal
   */
  title?: string;
  /**
   * Descripción o subtítulo del modal
   */
  description?: string;
  /**
   * Contenido del modal
   */
  children: React.ReactNode;
  /**
   * Tamaño del modal
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Si se puede cerrar haciendo click fuera del modal
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * Si se puede cerrar con la tecla ESC
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Clases CSS adicionales para el contenedor del modal
   */
  className?: string;
  /**
   * Si se debe mostrar el botón X de cerrar
   * @default true
   */
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-7xl'
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  showCloseButton = true,
  footer
}: ModalProps & { footer?: React.ReactNode }) {
  // Manejar el cierre con ESC
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar click en el overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Overlay/Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl border border-white/50 max-h-[90vh] overflow-hidden flex flex-col
        w-full transition-all duration-300 transform
        ${sizeClasses[size]}
        ${className}
      `}>
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex-1 pr-8">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-gray-900 mb-1"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-gray-500"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 rounded-full p-2"
                aria-label="Cerrar modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 pt-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para el footer del modal (opcional)
interface ModalFooterProps {
  /**
   * Contenido del footer
   */
  children: React.ReactNode;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}

// Hook personalizado para manejar modales
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  };
}

export default Modal;
