import React from 'react';
import Logo from '@/assets/logo.svg';

interface DeliveryLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const DeliveryLoader: React.FC<DeliveryLoaderProps> = ({
  size = 'md',
  message = 'Cargando...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Contenedor del carrito animado */}
      <div className="relative">
        {/* Logo fiel de Japi Express con efecto de latido */}
        <div className={`${sizeClasses[size]} relative animate-logo-heartbeat`}>
          {/* Fondo oscuro con bordes redondeados */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl opacity-90"></div>
          
          {/* Fondo con patrón sutil */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-700 to-transparent opacity-20 rounded-2xl"></div>
          
          <div className="relative w-full h-full flex items-center justify-center p-3">
            {/* Podemos usar la imagen del logo directamente */}
            <Logo className="w-full h-full object-contain" style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' }} />
            
            {/* Efectos de brillo superpuestos */}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-green-100 to-transparent opacity-0 animate-shine"></div>
            </div>
          </div>
        </div>

        {/* Efectos sutiles que complementan el logo con fondo oscuro */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Ondas de pulso suaves */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl border border-green-400 opacity-15 animate-pulse-ring" style={{ animationDelay: '0ms' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4/5 h-4/5 rounded-2xl border border-green-300 opacity-25 animate-pulse-ring" style={{ animationDelay: '400ms' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/5 h-3/5 rounded-2xl border border-green-200 opacity-35 animate-pulse-ring" style={{ animationDelay: '800ms' }}></div>
          </div>
          
          {/* Partículas de brillo discretas */}
          <div className="absolute top-4 right-4 w-1 h-1 bg-green-400 rounded-full animate-twinkle" style={{ animationDelay: '0ms' }}></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-green-300 rounded-full animate-twinkle" style={{ animationDelay: '600ms' }}></div>
          <div className="absolute top-1/3 left-3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1200ms' }}></div>
          <div className="absolute bottom-1/3 right-3 w-0.5 h-0.5 bg-green-200 rounded-full animate-twinkle" style={{ animationDelay: '1800ms' }}></div>
        </div>
      </div>

      {/* Mensaje de carga */}
      {message && (
        <div className="text-center">
          <p className={`${textSizes[size]} font-medium text-gray-700 animate-pulse`}>
            {message}
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-[color:var(--surface-dark)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[color:var(--surface-dark)] rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
            <div className="w-2 h-2 bg-[color:var(--surface-dark)] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryLoader;
