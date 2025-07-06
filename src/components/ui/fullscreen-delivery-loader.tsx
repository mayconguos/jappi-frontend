import React from 'react';
import DeliveryLoader from './delivery-loader';

interface FullScreenDeliveryLoaderProps {
  message?: string;
  isVisible: boolean;
}

const FullScreenDeliveryLoader: React.FC<FullScreenDeliveryLoaderProps> = ({
  message = 'Procesando tu solicitud...',
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <DeliveryLoader
          size="lg"
          message={message}
          className="mb-4"
        />
        <div className="mt-6">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500">
              Esto puede tomar unos momentos...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenDeliveryLoader;
