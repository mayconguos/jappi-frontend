export interface UserRole {
  value: number;
  label: string;
}

export const USER_ROLES: UserRole[] = [
  { value: 1, label: 'Administrador' },
  { value: 2, label: 'Cliente' },
  { value: 3, label: 'Transportista' },
  { value: 4, label: 'Almacén' },
  { value: 5, label: 'Coordinación' },
  { value: 6, label: 'Finanzas' }
];

// Constante para el rol de usuario por defecto
export const DEFAULT_USER_ROLE = 1 // Cliente
export const DEFAULT_CARRIER_ROLE = 3 // Transportista

// Función helper para obtener el label de un rol de usuario por su valor
export const getUserRoleLabel = (value: number): string => {
  const userRole = USER_ROLES.find(role => role.value === value);
  return userRole ? userRole.label : 'Desconocido';
};
