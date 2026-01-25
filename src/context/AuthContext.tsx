'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import secureLocalStorage from 'react-secure-storage';
import { LoginFormData } from '@/lib/validations/auth';
import api from '@/app/services/api';
import { getRedirectPathForUser } from '@/utils/roleUtils';

interface User {
  id: number;
  email: string;
  name: string;
  id_role: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = secureLocalStorage.getItem('user') as User | null;

      if (token && storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        secureLocalStorage.removeItem('user');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    secureLocalStorage.removeItem('user');
    setUser(null);
    router.replace('/login');
  }, [router]);

  const login = async (data: LoginFormData) => {
    try {
      const res = await api.post('/user/login', data);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      secureLocalStorage.setItem('user', user);
      setUser(user);

      const redirectPath = getRedirectPathForUser(user.id_role);
      router.push(redirectPath);
    } catch (error) {
      throw error;
    }
  };

  useLayoutEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (pathname !== '/login') {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, pathname]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
