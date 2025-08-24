"use client";

import React, { useState } from 'react';
import DeliveryLoader from '@/components/ui/delivery-loader';
import FullScreenDeliveryLoader from '@/components/ui/fullscreen-delivery-loader';
import { Button } from '@/components/ui/button';

export default function LoaderExamplesPage() {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  const simulateFullScreenLoading = () => {
    setShowFullScreen(true);
    setTimeout(() => {
      setShowFullScreen(false);
    }, 4000);
  };

  return (
    <div className="p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Jappi Express - Delivery Loaders
        </h1>
        <p className="text-gray-600">
          Componentes animados de carga para la aplicación
        </p>
      </div>

      {/* Ejemplos de diferentes tamaños */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Diferentes Tamaños
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="font-medium text-gray-700 mb-4">Pequeño (SM)</h3>
            <DeliveryLoader size="sm" message="Cargando..." />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="font-medium text-gray-700 mb-4">Mediano (MD)</h3>
            <DeliveryLoader size="md" message="Procesando..." />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="font-medium text-gray-700 mb-4">Grande (LG)</h3>
            <DeliveryLoader size="lg" message="Enviando datos..." />
          </div>
        </div>
      </section>

      {/* Ejemplos de uso en botones */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Uso en Botones y Formularios
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-4">Botón con Loading</h3>
            <Button
              onClick={simulateLoading}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <DeliveryLoader size="sm" message="" className="!space-y-0" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Realizar Acción</span>
              )}
            </Button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-4">Área de Carga</h3>
            <div className="min-h-[120px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <DeliveryLoader
                size="md"
                message="Subiendo archivos..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pantalla completa */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Loader de Pantalla Completa
        </h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-600 mb-4">
            Para procesos importantes como registro, login, envío de formularios, etc.
          </p>
          <Button onClick={simulateFullScreenLoading}>
            Mostrar Loader de Pantalla Completa
          </Button>
        </div>
      </section>

      {/* Diferentes mensajes */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mensajes Personalizados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <DeliveryLoader
              size="md"
              message="Registrando usuario..."
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <DeliveryLoader
              size="md"
              message="Verificando datos..."
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <DeliveryLoader
              size="md"
              message="Enviando solicitud..."
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <DeliveryLoader
              size="md"
              message="Procesando pago..."
            />
          </div>
        </div>
      </section>

      {/* Código de ejemplo */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Ejemplos de Uso en Código
        </h2>
        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            {`// Loader básico
<DeliveryLoader size="md" message="Cargando..." />

// En un botón
<Button disabled={isLoading}>
  {isLoading ? (
    <DeliveryLoader size="sm" message="" />
  ) : (
    "Enviar"
  )}
</Button>

// Pantalla completa
<FullScreenDeliveryLoader 
  isVisible={showLoader}
  message="Procesando tu solicitud..."
/>`}
          </pre>
        </div>
      </section>

      {/* Loader de pantalla completa */}
      <FullScreenDeliveryLoader
        isVisible={showFullScreen}
        message="Registrando tu cuenta en Jappi Express..."
      />
    </div>
  );
}
