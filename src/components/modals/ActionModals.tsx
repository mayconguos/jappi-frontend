import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Courier } from '@/types/courier';

// ─── AssignCarrierModal ─────────────────────────────────────────────────────

interface AssignCarrierModalProps {
  isOpen: boolean;
  isLoading: boolean;
  courierName?: string;
  entityLabel?: string; // e.g. "envío" | "recojo"
  onConfirm: () => void;
  onClose: () => void;
}

export function AssignCarrierModal({
  isOpen,
  isLoading,
  courierName,
  entityLabel = 'registro',
  onConfirm,
  onClose,
}: AssignCarrierModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      size="sm"
      title="Confirmar Asignación"
      footer={
        <ModalFooter className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button className="bg-[#02997d] hover:bg-[#027d66] text-white" onClick={onConfirm} disabled={isLoading}>
            Asignar
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        {isLoading ? (
          <DeliveryLoader message="Actualizando transportista..." />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-slate-600 font-medium mb-1">
              ¿Estás seguro que deseas asignar a <span className="font-bold text-slate-900">"{courierName}"</span> para este {entityLabel}?
            </p>
            <p className="text-sm text-slate-400">Esta acción actualizará la asignación del motorizado en el sistema.</p>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── ChangeStatusModal ──────────────────────────────────────────────────────

interface ChangeStatusModalProps {
  isOpen: boolean;
  isLoading: boolean;
  statusLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ChangeStatusModal({
  isOpen,
  isLoading,
  statusLabel,
  onConfirm,
  onClose,
}: ChangeStatusModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      size="sm"
      title="Confirmar Cambio de Estado"
      footer={
        <ModalFooter className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button className="bg-[#02997d] hover:bg-[#027d66] text-white" onClick={onConfirm} disabled={isLoading}>
            Confirmar
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        {isLoading ? (
          <DeliveryLoader message="Actualizando estado..." />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-slate-600 font-medium mb-1">
              ¿Estás seguro que deseas cambiar el estado a <span className="font-bold text-slate-900">"{statusLabel}"</span>?
            </p>
            <p className="text-sm text-slate-400">Esta acción actualizará el flujo logístico del registro.</p>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── CancelConfirmModal ──────────────────────────────────────────────────────

interface CancelConfirmModalProps {
  isOpen: boolean;
  entityLabel?: string; // e.g. "envío" | "recojo"
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelConfirmModal({
  isOpen,
  entityLabel = 'registro',
  onConfirm,
  onClose,
}: CancelConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={`Cancelar ${entityLabel}`}
      footer={
        <ModalFooter className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="destructive" onClick={onConfirm}>Cancelar {entityLabel}</Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Truck className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-slate-600 font-medium mb-1">¿Estás seguro que deseas cancelar este {entityLabel}?</p>
        <p className="text-sm text-slate-400">Esta acción removerá el {entityLabel} de la lista permanentemente.</p>
      </div>
    </Modal>
  );
}

// ─── BatchAssignModal ───────────────────────────────────────────────────────

interface BatchAssignModalProps {
  isOpen: boolean;
  isLoading: boolean;
  selectedCount: number;
  entityLabelPlural?: string; // e.g. "envíos" | "recojos"
  couriers: Courier[];
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function BatchAssignModal({
  isOpen,
  isLoading,
  selectedCount,
  entityLabelPlural = 'registros',
  couriers,
  value,
  onChange,
  onConfirm,
  onClose,
}: BatchAssignModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      size="sm"
      title="Asignación Masiva"
      footer={
        <ModalFooter className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onConfirm} disabled={isLoading || !value}>
            Confirmar Asignación
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
          <Truck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-slate-600 font-medium">
            Asignar un transportista a los <span className="font-bold text-slate-900">{selectedCount}</span> {entityLabelPlural} seleccionados.
          </p>
          <p className="text-xs text-slate-400 mt-1">Los {entityLabelPlural} pasarán automáticamente a estado "Programado".</p>
        </div>
        <div className="w-full pt-2">
          <Select
            label="Seleccionar Transportista"
            value={value}
            onChange={onChange}
            options={couriers.map(c => ({
              label: `${c.first_name} ${c.last_name || ''}`.trim(),
              value: c.id.toString(),
            }))}
            placeholder="Elegir motorizado..."
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── BatchStatusModal ───────────────────────────────────────────────────────

interface BatchStatusModalProps {
  isOpen: boolean;
  isLoading: boolean;
  selectedCount: number;
  entityLabelPlural?: string;
  statusOptions: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function BatchStatusModal({
  isOpen,
  isLoading,
  selectedCount,
  entityLabelPlural = 'registros',
  statusOptions,
  value,
  onChange,
  onConfirm,
  onClose,
}: BatchStatusModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      size="sm"
      title="Cambio de Estado Masivo"
      footer={
        <ModalFooter className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onConfirm} disabled={isLoading || !value}>
            Confirmar cambio
          </Button>
        </ModalFooter>
      }
    >
      <div className="flex flex-col items-center text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <p className="text-slate-600 font-medium">
            Cambiar el estado de los <span className="font-bold text-slate-900">{selectedCount}</span> {entityLabelPlural} seleccionados.
          </p>
          <p className="text-xs text-slate-400 mt-1">Este cambio afectará el flujo logístico de todos los pedidos seleccionados.</p>
        </div>
        <div className="w-full pt-2">
          <Select
            label="Nuevo Estado"
            value={value}
            onChange={onChange}
            options={statusOptions}
            placeholder="Elegir estado..."
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
}
