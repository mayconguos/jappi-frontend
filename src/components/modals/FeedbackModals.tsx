import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';

// ─── FeedbackModal ─────────────────────────────────────────────────────────
// Unifica los modales de Éxito y Advertencia en un solo componente.

interface SuccessModalProps {
  message: string | null;
  onClose: () => void;
}

export function SuccessModal({ message, onClose }: Readonly<SuccessModalProps>) {
  return (
    <Modal
      isOpen={!!message}
      onClose={onClose}
      size="sm"
      title="Operación Exitosa"
      footer={
        <ModalFooter className="justify-center">
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
            Aceptar
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </Modal>
  );
}

interface WarningModalProps {
  modal: { title: string; message: string } | null;
  onClose: () => void;
}

export function WarningModal({ modal, onClose }: Readonly<WarningModalProps>) {
  return (
    <Modal
      isOpen={!!modal}
      onClose={onClose}
      size="sm"
      title={modal?.title ?? 'Advertencia'}
      footer={
        <ModalFooter className="justify-center">
          <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto">
            Entendido
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-slate-600 font-medium">{modal?.message}</p>
      </div>
    </Modal>
  );
}
