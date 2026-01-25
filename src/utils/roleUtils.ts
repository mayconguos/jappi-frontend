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

export const getRedirectPathForUser = (roleNumber: number): string => {
  const roleName = getRoleNameFromNumber(roleNumber);

  switch (roleName) {
    case 'admin':
      return '/dashboard/accounts/pending';
    case 'coordinacion':
      return '/dashboard/shipments/calendar';
    case 'empresa':
      return '/dashboard/shipments/new';
    case 'transportista':
      return '/dashboard/carrier/pickups';
    case 'almacen':
      return '/dashboard/inventory/requests';
    default:
      return '/dashboard';
  }
};
