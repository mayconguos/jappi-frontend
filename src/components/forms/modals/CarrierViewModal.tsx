'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { 
  User, 
  Mail, 
  Truck, 
  Fingerprint, 
  Gauge, 
  Car, 
  Shield,
  CreditCard,
  Hash,
  Activity,
  IdCard
} from 'lucide-react';

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

  if (!isOpen || !carrier) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Información del Transportista"
      description={`Visualizando perfil de ${carrier.first_name} ${carrier.last_name}`}
      size="xl"
      showCloseButton
    >
      <div className="space-y-4">
        
        {/* Información Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-[#02997d] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <User size={14} />
              </div>
              Perfil Personal
            </h4>
          </div>

          <Input
            label="Nombres"
            size="compact"
            icon={User}
            value={carrier.first_name || ''}
            readOnly
            className="bg-gray-50 border-gray-200"
          />
          
          <Input
            label="Apellidos"
            size="compact"
            icon={User}
            value={carrier.last_name || ''}
            readOnly
            className="bg-gray-50 border-gray-200"
          />

          <div className="flex gap-3 md:col-span-2">
            <div className="flex-1">
              <Input
                label="Tipo de documento"
                size="compact"
                icon={IdCard}
                value={carrier.document_type}
                readOnly
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Número de documento"
                size="compact"
                icon={Fingerprint}
                value={carrier.document_number || ''}
                readOnly
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <Input
            label="Correo electrónico"
            size="compact"
            icon={Mail}
            value={carrier.email || ''}
            readOnly
            className="bg-gray-50 border-gray-200"
          />

          <Input
            label="ID transportista"
            size="compact"
            icon={Hash}
            value={carrier.id.toString()}
            readOnly
            className="bg-gray-50 border-gray-200"
          />
        </div>

        {/* Datos del Vehículo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-gray-100">
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-[#02997d] mb-2 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Truck size={14} />
              </div>
              Vehículo y Licencia
            </h4>
          </div>

          <Input
            label="Tipo de vehículo"
            size="compact"
            icon={Car}
            value={carrier.vehicle_type}
            readOnly
            className="bg-gray-50 border-gray-200"
          />

          <Input
            label="Marca"
            size="compact"
            icon={Shield}
            value={carrier.brand || ''}
            readOnly
            className="bg-gray-50 border-gray-200"
          />

          <Input
            label="Modelo"
            size="compact"
            icon={Truck}
            value={carrier.model || ''}
            readOnly
            className="bg-gray-50 border-gray-200"
          />

          <Input
            label="Placa de rodaje"
            size="compact"
            icon={CreditCard}
            value={carrier.plate_number || ''}
            readOnly
            className="bg-gray-50 border-gray-200"
          />

          <Input
            label="Licencia de conducir"
            size="compact"
            icon={Gauge}
            value={carrier.license || ''}
            readOnly
            className="bg-gray-50 border-gray-200"
          />

          <Input
            label="Estado actual"
            size="compact"
            icon={Activity}
            value={carrier.status === 1 ? 'ACTIVO' : 'INACTIVO'}
            readOnly
            className={carrier.status === 1 ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" : "bg-red-50 border-red-100 text-red-700 font-bold"}
          />
        </div>

        <ModalFooter className="pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="bg-white border text-slate-700 hover:bg-slate-50 min-w-[100px]"
          >
            Cerrar
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}