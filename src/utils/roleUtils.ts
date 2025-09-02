import { roleRoutes, Role } from '@/constants/roleRoutes';

// Mapeo de roles numéricos a nombres
export const getRoleNameFromNumber = (roleNumber: number): Role | null => {
  const roleMap: Record<number, Role> = {
    1: 'admin',
    2: 'empresa',
    3: 'transportista',
    4: 'almacen',
    5: 'coordinacion'
  };
  return roleMap[roleNumber] || null;
};

export const getUserRoutes = (userType: number) => {
  const userRole = getRoleNameFromNumber(userType);
  return userRole ? roleRoutes[userRole] || [] : [];
};
