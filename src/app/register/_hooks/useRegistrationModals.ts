'use client';

import { useState } from 'react';
import { useModal } from '@/components/ui/modal';

export function useRegistrationModals() {
  // Modal de confirmación
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();

  // Modal de éxito
  const { isOpen: isSuccessModalOpen, openModal: openSuccessModal, closeModal: closeSuccessModal } = useModal();

  // Modal de error
  const { isOpen: isErrorModalOpen, openModal: openErrorModal, closeModal: closeErrorModal } = useModal();

  // Estado para el mensaje de error
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');

  // Función helper para mostrar error
  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    openErrorModal();
  };

  return {
    // Modal de confirmación
    confirmationModal: {
      isOpen: isModalOpen,
      open: openModal,
      close: closeModal
    },
    
    // Modal de éxito
    successModal: {
      isOpen: isSuccessModalOpen,
      open: openSuccessModal,
      close: closeSuccessModal
    },
    
    // Modal de error
    errorModal: {
      isOpen: isErrorModalOpen,
      open: openErrorModal,
      close: closeErrorModal,
      title: errorTitle,
      message: errorMessage,
      showError
    }
  };
}