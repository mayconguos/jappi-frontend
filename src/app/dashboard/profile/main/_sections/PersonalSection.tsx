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
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Información Personal</h3>
          <p className="text-xs text-gray-500 mt-0.5">Datos registrados del titular de la cuenta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((item, idx) => (
          <div key={idx} className={`${item.fullWidth ? 'md:col-span-2' : ''} group`}>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <item.icon size={14} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
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

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
        <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-bold text-amber-900">Datos Protegidos</p>
          <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
            Por seguridad, la información personal solo puede ser modificada contactando directamente con el administrador de Japi Express.
          </p>
        </div>
      </div>
    </div>
  );
}