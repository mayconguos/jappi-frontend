export interface UserType {
  value: number;
  label: string;
}

export const USER_TYPES: UserType[] = [
  { value: 1, label: 'Cliente' },
  { value: 2, label: 'Admin' },
  { value: 3, label: 'Motorizado' },
  { value: 4, label: 'Almacén' },
  { value: 5, label: 'Coordinación' },
];

// Constante para el tipo de usuario por defecto
export const DEFAULT_USER_TYPE = 2; // Admin

// Función helper para obtener el label de un tipo de usuario por su valor
export const getUserTypeLabel = (value: number): string => {
  const userType = USER_TYPES.find(type => type.value === value);
  return userType ? userType.label : 'Desconocido';
};
