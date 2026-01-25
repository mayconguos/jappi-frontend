import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import RegisterForm from './_components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Sección Izquierda - Branding e Imagen */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[color:var(--surface-dark)] overflow-hidden items-center justify-center">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background_humano.png"
            alt="Logistic Background"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--surface-dark)]/80 to-[#001524]/90 mix-blend-multiply" />
        </div>

        {/* Contenido Branding */}
        <div className="relative z-10 p-12 text-white max-w-2xl">
          <div className="mb-12">
            <Logo className="w-20 h-20 text-white mb-6" />
            <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
              Únete a la red logística <br />
              <span className="text-[#00A9C1]">más eficiente</span> del país.
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed font-light">
              Gestiona tus envíos, optimiza costos y escala tu negocio con nuestra plataforma integral de transporte y logística.
            </p>
          </div>

          {/* Stats o Trust Badges (Opcional, similar al login) */}
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-3xl font-bold text-white mb-1">+500</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Empresas Confían</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">24/7</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Soporte Activo</p>
            </div>
          </div>
        </div>

        {/* Elementos decorativos (círculos/formas) */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#00A9C1] rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] opacity-10"></div>
      </div>

      {/* Sección Derecha - Formulario Wizard */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white lg:px-0">
        <RegisterForm />
      </div>
    </div>
  );
}