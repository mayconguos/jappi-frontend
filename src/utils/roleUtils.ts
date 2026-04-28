import { roleRoutes, Role } from '@/constants/roleRoutes';

// Mapeo de roles numéricos a nombres
export const getRoleNameFromNumber = (roleNumber: number): Role | null => {
  const roleMap: Record<number, Role> = {
    1: 'admin',
    2: 'empresa',
    3: 'transportista',
    4: 'almacen',
    5: 'coordinacion',
    6: 'despacho'
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
      return '/dashboard/shipments/all';
    case 'empresa':
      return '/dashboard/shipments/new';
    case 'transportista':
      return '/dashboard/carrier/pickups';
    case 'almacen':
      return '/dashboard/inventory/requests';
    case 'despacho':
      return '/dashboard/inventory/dispatches';
    default:
      return '/dashboard';
  }
};
export const isPathAllowed = (path: string, userType: number): boolean => {
  // El dashboard base siempre está permitido
  if (path === '/dashboard') return true;

  const userRoutes = getUserRoutes(userType);
  // Verificamos si la ruta actual coincide exactamente o es una subruta de una permitida
  return userRoutes.some(route =>
    path === route.path || path.startsWith(`${route.path}/`)
  );
};
