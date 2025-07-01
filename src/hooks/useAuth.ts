'use client';

import { useRouter } from 'next/navigation';
import secureLocalStorage from 'react-secure-storage';

export const useAuth = () => {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    secureLocalStorage.removeItem('user');
    router.push('/login');
  };

  const getStoredUser = () => {
    const storedUser = secureLocalStorage.getItem('user');
    return storedUser && typeof storedUser === 'object' ? storedUser as { type: number } : null;
  };

  return {
    logout,
    getStoredUser
  };
};
