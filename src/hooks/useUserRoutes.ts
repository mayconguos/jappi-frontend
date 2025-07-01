'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './useAuth';
import { getUserRoutes } from '@/utils/roleUtils';
import { RouteItem } from '@/constants/roleRoutes';

export const useUserRoutes = () => {
  const pathname = usePathname();
  const { getStoredUser } = useAuth();
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      const userRoutes = getUserRoutes(storedUser.type);
      setRoutes(userRoutes);
      
      // Obtener el título de la página actual
      const currentRoute = userRoutes.find(route => route.path === pathname);
      setPageTitle(currentRoute?.label || 'Dashboard');
    }
  }, [pathname, getStoredUser]);

  return {
    routes,
    pageTitle
  };
};
