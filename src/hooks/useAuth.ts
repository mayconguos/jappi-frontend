'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';

export const useAuth = () => {
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    secureLocalStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  const getStoredUser = useCallback(() => {
    const storedUser = secureLocalStorage.getItem('user');
    return storedUser && typeof storedUser === 'object' ? storedUser as { id_role: number } : null;
  }, []);

  return {
    logout,
    getStoredUser
  };
};
