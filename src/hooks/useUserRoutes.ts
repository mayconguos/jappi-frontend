'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserRoutes } from '@/utils/roleUtils';
import { RouteItem } from '@/constants/roleRoutes';

export const useUserRoutes = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    if (user) {
      const userRoutes = getUserRoutes(user.id_role);
      setRoutes(userRoutes);

      // Obtener el título de la página actual
      const currentRoute = userRoutes.find(route => route.path === pathname);
      setPageTitle(currentRoute?.label || 'Dashboard');
    }
  }, [pathname, user]);

  return {
    routes,
    pageTitle
  };
};
