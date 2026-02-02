import { getDocumentTypeLabel } from '@/constants/documentTypes';
import { User, Mail, CreditCard, ShieldCheck } from 'lucide-react';

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
  const details = [
    { label: 'Nombres', value: user.first_name, icon: User },
    { label: 'Apellidos', value: user.last_name, icon: User },
    { label: 'Tipo de Documento', value: getDocumentTypeLabel(user.document_type), icon: ShieldCheck },
    { label: 'Número de Documento', value: user.document_number, icon: CreditCard },
    { label: 'Correo Electrónico', value: user.email, icon: Mail, fullWidth: true },
  ];

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
          <User size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Información Personal</h3>
          <p className="text-sm text-gray-500 mt-0.5">Datos registrados del titular de la cuenta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {details.map((item, idx) => (
          <div key={idx} className={`${item.fullWidth ? 'md:col-span-2' : ''} group`}>
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={16} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{item.label}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 transition-all group-hover:bg-white group-hover:shadow-md group-hover:shadow-gray-200/50 group-hover:border-emerald-500/20">
              <p className="text-base font-medium text-gray-900">
                {item.value || (
                  <span className="italic text-gray-400 font-normal">No especificado</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
        <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-semibold text-amber-900">Datos Protegidos</p>
          <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
            Por seguridad, la información personal solo puede ser modificada contactando directamente con el administrador de Japi Express.
          </p>
        </div>
      </div>
    </div>
  );
}