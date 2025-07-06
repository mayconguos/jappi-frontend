'use client';

import React from 'react';

interface SelectionCardProps {
  /**
   * Identificador único para la card
   */
  id: string;
  /**
   * Título principal de la card
   */
  title: string;
  /**
   * Descripción o subtítulo de la card
   */
  description: string;
  /**
   * Elemento de icono (puede ser SVG, componente de icono, etc.)
   */
  icon: React.ReactNode;
  /**
   * Color del tema para gradientes y efectos hover
   * @default 'blue'
   */
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
  /**
   * Si la card está seleccionada
   * @default false
   */
  isSelected?: boolean;
  /**
   * Si la card está deshabilitada
   * @default false
   */
  disabled?: boolean;
  /**
   * Función que se ejecuta al hacer click en la card
   */
  onClick?: (id: string) => void;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    hover: 'hover:border-blue-500',
    selectedBorder: 'border-blue-500',
    selectedBg: 'bg-blue-50',
    hoverText: 'group-hover:text-blue-600'
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    hover: 'hover:border-green-500',
    selectedBorder: 'border-green-500',
    selectedBg: 'bg-green-50',
    hoverText: 'group-hover:text-green-600'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    hover: 'hover:border-purple-500',
    selectedBorder: 'border-purple-500',
    selectedBg: 'bg-purple-50',
    hoverText: 'group-hover:text-purple-600'
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    hover: 'hover:border-red-500',
    selectedBorder: 'border-red-500',
    selectedBg: 'bg-red-50',
    hoverText: 'group-hover:text-red-600'
  },
  yellow: {
    gradient: 'from-yellow-500 to-yellow-600',
    hover: 'hover:border-yellow-500',
    selectedBorder: 'border-yellow-500',
    selectedBg: 'bg-yellow-50',
    hoverText: 'group-hover:text-yellow-600'
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    hover: 'hover:border-indigo-500',
    selectedBorder: 'border-indigo-500',
    selectedBg: 'bg-indigo-50',
    hoverText: 'group-hover:text-indigo-600'
  }
};

export function SelectionCard({
  id,
  title,
  description,
  icon,
  color = 'blue',
  isSelected = false,
  disabled = false,
  onClick,
  className = ''
}: SelectionCardProps) {
  const colors = colorVariants[color];

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        border-2 rounded-lg p-6 transition-all duration-300 group
        ${disabled 
          ? 'cursor-not-allowed opacity-50 border-gray-200' 
          : 'cursor-pointer hover:shadow-lg'
        }
        ${isSelected 
          ? `${colors.selectedBorder} ${colors.selectedBg} shadow-md` 
          : `border-gray-200 ${!disabled ? colors.hover : ''}`
        }
        ${className}
      `}
    >
      <div className="text-center space-y-4">
        {/* Contenedor del icono */}
        <div className={`
          w-16 h-16 mx-auto bg-gradient-to-br ${colors.gradient} rounded-full 
          flex items-center justify-center transition-transform duration-300
          ${!disabled ? 'group-hover:scale-110' : ''}
          ${isSelected ? 'shadow-lg' : ''}
        `}>
          <div className="text-white w-8 h-8 flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Título */}
        <h3 className={`
          text-lg font-semibold transition-colors duration-300
          ${isSelected 
            ? colors.hoverText.replace('group-hover:', '') 
            : `text-gray-800 ${!disabled ? colors.hoverText : ''}`
          }
        `}>
          {title}
        </h3>

        {/* Descripción */}
        <p className={`
          text-sm transition-colors duration-300
          ${isSelected ? 'text-gray-700' : 'text-gray-600'}
        `}>
          {description}
        </p>

        {/* Indicador de selección */}
        {isSelected && (
          <div className="flex items-center justify-center mt-2">
            <div className={`
              w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} 
              flex items-center justify-center shadow-sm
            `}>
              <svg 
                className="w-4 h-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para contenedor de múltiples cards
interface SelectionCardGroupProps {
  /**
   * Título del grupo de cards
   */
  title?: string;
  /**
   * Descripción del grupo
   */
  description?: string | React.ReactNode;
  /**
   * Cards a mostrar
   */
  children: React.ReactNode;
  /**
   * Número de columnas en el grid
   * @default 2
   */
  columns?: 1 | 2 | 3 | 4;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export function SelectionCardGroup({
  title,
  description,
  children,
  columns = 2,
  className = ''
}: SelectionCardGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Encabezado del grupo */}
      {(title || description) && (
        <div className="text-center">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600 mb-6">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Grid de cards */}
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {children}
      </div>
    </div>
  );
}

export default SelectionCard;
