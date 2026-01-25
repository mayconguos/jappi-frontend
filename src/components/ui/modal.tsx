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
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">

        {/* Overlay/Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div className={`
          relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl border border-gray-100/50 transition-all sm:my-8 w-full
          ${sizeClasses[size]}
          ${className}
        `}>

          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                {title && (
                  <h3 className="text-xl font-semibold leading-6 text-gray-900" id="modal-title">
                    {title}
                  </h3>
                )}
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500" id="modal-description">
                      {description}
                    </p>
                  </div>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors"
                  onClick={onClose}
                  aria-label="Cerrar"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-6 sm:p-8">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl border-t border-gray-100">
              {footer}
            </div>
          )}
        </div>
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
