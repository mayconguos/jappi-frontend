import { Input } from '@/components/ui/input';
import { getDocumentTypeLabel } from '@/constants/documentTypes';

interface User {
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password?: string;
}

interface PersonalSectionProps {
  user: User;
}

export default function PersonalSection({ user }: PersonalSectionProps) {
  return (
    <div className="space-y-6">
      {/* Primera fila: Nombres y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Nombres"
            value={user.first_name || 'No especificado'}
            disabled
          />
        </div>

        <div>
          <Input
            label="Apellidos"
            value={user.last_name || 'No especificado'}
            disabled
          />
        </div>
      </div>

      {/* Segunda fila: Tipo de Documento, Número de Documento y Correo Electrónico */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div>
          <Input
            label="Tipo de Documento"
            value={getDocumentTypeLabel(user.document_type) || 'No especificado'}
            disabled
          />
        </div>

        <div>
          <Input
            label="Número de Documento"
            value={user.document_number || 'No especificado'}
            disabled
          />
        </div>

        <div className="md:col-span-2 xl:col-span-1">
          <Input
            label="Correo Electrónico"
            value={user.email || 'No especificado'}
            disabled
          />
        </div>
      </div>
    </div>
  );
}