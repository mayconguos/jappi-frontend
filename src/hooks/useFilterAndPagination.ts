'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseFilterAndPaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  filterFields?: (keyof T)[];
}

export const useFilterAndPagination = <T>({
  data,
  itemsPerPage = 10,
  filterFields = []
}: UseFilterAndPaginationProps<T>) => {
  const [filterField, setFilterField] = useState<keyof T>(filterFields[0] as keyof T);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return data;
    
    const searchLower = searchValue.toLowerCase();
    return data.filter((item) => {
      const fieldValue = item[filterField as keyof T];
      return fieldValue?.toString().toLowerCase().includes(searchLower);
    });
  }, [data, filterField, searchValue]);

  // Datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Resetear página cuando cambian los datos o filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchValue]);

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchValue('');
    setFilterField(filterFields[0] as keyof T);
    setCurrentPage(1);
  };

  return {
    // Estados
    filterField,
    searchValue,
    currentPage,
    
    // Datos procesados
    filteredData,
    paginatedData,
    
    // Información de paginación
    totalItems: filteredData.length,
    startIndex: (currentPage - 1) * itemsPerPage,
    
    // Handlers
    setFilterField,
    setSearchValue,
    handleFilter,
    handlePageChange,
    clearFilters
  };
};
