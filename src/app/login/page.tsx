import LoginForm from '@/components/forms/LoginForm';
import Image from 'next/image';
import Logo from '@/assets/logo.svg';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sección Izquierda - Branding e Imagen (Visible en Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[color:var(--surface-dark)] overflow-hidden items-center justify-center">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background_humano.png"
            // src="/images/background_futurista.png"
            // src="/images/background_abstracto.png"
            alt="Logistic Background"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            priority
          />
          {/* Fallback pattern/gradient if image fails or while loading */}
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--surface-dark)] to-[#0f2e2e] opacity-90 mix-blend-multiply"></div>
        </div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 p-12 text-white max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <Logo className="w-32 h-32 text-white" />
            <h1 className="text-4xl font-bold tracking-tight">Japi Express</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold leading-tight">
              Gestión logística inteligente para tu negocio
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Controla envíos, almacenes y entregas en tiempo real.
              <br />
              La plataforma diseñada para escalar tus operaciones.
            </p>

            {/* Stats o Trust Badges pequeños */}
            <div className="flex gap-8 pt-4 border-t border-white/10 mt-8">
              <div>
                <p className="text-2xl font-bold text-[color:var(--button-hover-color)]">+50k</p>
                <p className="text-sm text-gray-400">Envíos mensuales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[color:var(--button-hover-color)]">99.9%</p>
                <p className="text-sm text-gray-400">Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[color:var(--button-hover-color)]">24/7</p>
                <p className="text-sm text-gray-400">Soporte</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-[480px] px-8 sm:px-12 py-12">

          {/* Header Mobile (Logo visible solo en mobile) */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-2">
              <Logo className="w-10 h-10 text-[var(--surface-dark)]" />
              <span className="text-xl font-bold text-gray-900">Japi Express</span>
            </div>
          </div>

          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Te damos la bienvenida
            </h1>
            <p className="mt-3 text-base text-gray-500">
              Ingresa a tu cuenta o regístrate para comenzar.
            </p>
          </div>

          <LoginForm />

          <div className="mt-12 space-y-4">
            <p className="text-center text-xs text-gray-400">
              Al iniciar sesión, aceptas nuestros{' '}
              <a
                href="https://drive.google.com/file/d/1MHvTB9t3uQervfF1MYtHC_3nA8oyllcA/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-500 hover:text-gray-900 underline transition-colors"
              >
                Términos y Condiciones
              </a>.
            </p>
            <p className="text-center text-xs text-gray-300">
              © 2025 Japi Express. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

