'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import Modal, { ModalFooter } from '@/components/ui/modal';

import { PERSONAL_DOCUMENT_TYPES } from '@/constants/documentTypes';
import { VEHICLE_TYPES } from '@/constants/formOptions';

interface Carrier {
  id: number;
  document_number: string;
  document_type: string;
  email: string;
  first_name: string;
  last_name: string | null;
  license: string;
  brand: string;
  model: string;
  plate_number: string;
  vehicle_type: string;
  status: number;
  id_role: number;
}

interface CarrierViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  carrier?: Carrier | null;
}

export default function CarrierViewModal({ isOpen, onClose, carrier }: CarrierViewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !carrier) return null;



  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Detalles del transportista: ${carrier.first_name} ${carrier.last_name}`}
      size="xl"
      showCloseButton
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fila 1: Correo | ID */}
          <div>
            <Input
              type="email"
              label="Correo electrónico"
              size="compact"
              value={carrier.email || ''}
              readOnly
              disabled
            />
          </div>
          <div>
            <Input
              label="ID del transportista"
              size="compact"
              value={carrier.id.toString()}
              readOnly
              disabled
            />
          </div>

          {/* Fila 2: Nombre | Apellido */}
          <div>
            <Input
              label="Nombre"
              size="compact"
              value={carrier.first_name || ''}
              readOnly
              disabled
            />
          </div>
          <div>
            <Input
              label="Apellido"
              size="compact"
              value={carrier.last_name || ''}
              readOnly
              disabled
            />
          </div>

          {/* Fila 3: Tipo documento | Número de documento */}
          <div>
            <Select
              label="Tipo de documento"
              size="compact"
              value={carrier.document_type}
              options={PERSONAL_DOCUMENT_TYPES}
              onChange={() => { }} // Empty function since it's disabled
              disabled
            />
          </div>
          <div>
            <Input
              label="Número de documento"
              size="compact"
              value={carrier.document_number || ''}
              readOnly
              disabled
            />
          </div>

          {/* Fila 4: Tipo de vehículo | Marca */}
          <div className="md:col-span-1">
            <Select
              label="Tipo de vehículo"
              size="compact"
              value={carrier.vehicle_type}
              options={VEHICLE_TYPES.map(type => ({ label: type.label, value: type.value }))}
              onChange={() => { }} // Empty function since it's disabled
              disabled
            />
          </div>
          <div className="md:col-span-1">
            <Input
              label="Marca"
              size="compact"
              value={carrier.brand || ''}
              readOnly
              disabled
            />
          </div>

          {/* Fila 5: Modelo | Placa */}
          <div className="md:col-span-1">
            <Input
              label="Modelo"
              size="compact"
              value={carrier.model || ''}
              readOnly
              disabled
            />
          </div>
          <div className="md:col-span-1">
            <Input
              label="Placa"
              size="compact"
              value={carrier.plate_number || ''}
              readOnly
              disabled
            />
          </div>

          {/* Fila 6: Licencia | Estado */}
          <div className="md:col-span-1">
            <Input
              label="Licencia"
              size="compact"
              value={carrier.license || ''}
              readOnly
              disabled
            />
          </div>
          <div className="md:col-span-1">
            <Input
              label="Estado"
              size="compact"
              value={carrier.status === 1 ? 'Activo' : 'Inactivo'}
              readOnly
              disabled
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            type="button"
            onClick={handleClose}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cerrar
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}