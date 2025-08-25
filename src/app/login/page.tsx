import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con gradiente corporativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50"></div>

      {/* Patrón de fondo con colores corporativos */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[color:var(--button-hover-color)] rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[color:var(--surface-dark)] rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[color:var(--button-hover-color)] rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Elementos decorativos corporativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Líneas sutiles corporativas */}
        <div className="absolute top-1/4 left-0 w-48 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent opacity-30"></div>
        <div className="absolute top-1/2 right-0 w-64 h-px bg-gradient-to-l from-transparent via-slate-300 to-transparent opacity-30"></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent opacity-30"></div>

        {/* Círculos decorativos */}
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-teal-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-slate-400 rounded-full opacity-40 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-40 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>

      {/* Footer minimalista */}
      <div className="absolute bottom-0 left-0 w-full py-4 text-center z-10 bg-white bg-opacity-80">
        <p className="text-sm text-gray-500">
          © 2025 Jappi Express - Conectando destinos, entregando confianza
        </p>
      </div>
    </div>
  );
}
