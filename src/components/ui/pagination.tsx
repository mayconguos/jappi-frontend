'use client';

import * as React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const generatePagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages - 1, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  };

  const pages = generatePagination(currentPage, totalPages);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 sm:gap-0">
      {/* Info text */}
      {showInfo && (
        <div className="text-sm text-gray-500 order-2 sm:order-1">
          Mostrando <span className="font-medium text-gray-900">{startIndex + 1}</span> - <span className="font-medium text-gray-900">{endIndex}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="gap-1 pl-2.5"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:inline-block">Anterior</span>
        </Button>

        {/* Page Numbers - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, i) => (
            <React.Fragment key={i}>
              {page === '...' ? (
                <span className="flex items-center justify-center w-9 h-9 text-sm text-gray-400 select-none">
                  ...
                </span>
              ) : (
                <Button
                  variant={currentPage === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={clsx(
                    "w-9 h-9 p-0", // Square fixed size
                    currentPage !== page && "font-normal text-gray-500" // Lighter text for inactive
                  )}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Page Indicator (Visible only on mobile when numbers hidden) */}
        <span className="sm:hidden text-sm text-gray-700 font-medium">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="gap-1 pr-2.5"
        >
          <span className="sr-only sm:not-sr-only sm:inline-block">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
