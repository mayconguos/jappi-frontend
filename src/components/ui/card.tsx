import React from 'react';

// Added className prop to CardProps to allow custom styling
interface CardProps {
  description: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'basic' | 'outlined' | 'elevated';
  className?: string;
}

const Card: React.FC<CardProps> = ({ description, footer, variant = 'basic', className }) => {
  const baseClasses = 'p-4 rounded-lg';
  const variantClasses = {
    basic: 'bg-white shadow-md',
    outlined: 'border border-gray-300 bg-white',
    elevated: 'bg-white shadow-lg',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="space-y-4">
        {description}
      </div>
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
};

export default Card;
