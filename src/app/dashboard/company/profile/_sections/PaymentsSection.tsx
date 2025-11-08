import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveButton } from '@/components/ui/save-button';

interface PaymentApp {
  app_name: string;
  phone_number: string;
  account_holder: string;
  document_number: string;
}

interface PaymentsSectionProps {
  paymentApps: PaymentApp[];
  onUpdate: (paymentApps: Array<{
    app_name: string;
    phone_number: string;
    account_holder: string;
    document_number: string;
  }>) => void;
  onSave: () => Promise<boolean>;
}

export default function PaymentsSection({
  paymentApps,
  onUpdate,
  onSave
}: PaymentsSectionProps) {
  // Función interna para manejar cambios en apps de pago
  const handlePaymentAppsChange = (updatedApps: PaymentApp[]) => {
    onUpdate(updatedApps);
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Configura las aplicaciones de pago móvil para facilitar las transacciones.
      </p>

      {paymentApps.map((app, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                label="Aplicación"
                value={app.app_name}
                onChange={(value) => {
                  const updatedApps = [...paymentApps];
                  updatedApps[index] = { ...app, app_name: value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="Yape"
              />
            </div>

            <div>
              <Input
                label="Número de Teléfono"
                value={app.phone_number}
                onChange={(value) => {
                  const updatedApps = [...paymentApps];
                  updatedApps[index] = { ...app, phone_number: value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="911111111"
                maxLength={9}
              />
            </div>

            <div>
              <Input
                label="Titular de la Cuenta"
                value={app.account_holder}
                onChange={(value) => {
                  const updatedApps = [...paymentApps];
                  updatedApps[index] = { ...app, account_holder: value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="Nombre del titular"
              />
            </div>

            <div>
              <Input
                label="Número de Documento"
                value={app.document_number}
                onChange={(value) => {
                  const updatedApps = [...paymentApps];
                  updatedApps[index] = { ...app, document_number: value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="Documento del titular"
              />
            </div>
          </div>
        </div>
      ))}

      {paymentApps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay aplicaciones de pago configuradas</p>
          <Button
            onClick={() => handlePaymentAppsChange([{
              app_name: '',
              phone_number: '',
              account_holder: '',
              document_number: ''
            }])}
            className="mt-2"
            variant="outline"
          >
            Agregar aplicación de pago
          </Button>
        </div>
      )}

      {paymentApps.length > 0 && (
        <Button
          onClick={() => handlePaymentAppsChange([
            ...paymentApps,
            {
              app_name: '',
              phone_number: '',
              account_holder: '',
              document_number: ''
            }
          ])}
          variant="outline"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Agregar otra aplicación
        </Button>
      )}

      {/* Botón de guardar */}
      <SaveButton onSave={onSave} />
    </div>
  );
}