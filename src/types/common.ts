// Tipos de utilidad para manejo de entidades
export type EntityWithId = {
  id: number;
};

export type CreateEntity<T extends EntityWithId> = Omit<T, 'id'>;
export type UpdateEntity<T extends EntityWithId> = Partial<T> & { id: number };

// Tipos para paginación
export interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

// Tipos para filtros
export interface FilterOption {
  value: string;
  label: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
