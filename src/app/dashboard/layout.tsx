'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import secureLocalStorage from 'react-secure-storage';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

interface UserData {
  id: number;
  email: string;
  name: string;
  id_role: number;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = secureLocalStorage.getItem('user');
    if (!token || !storedUser) {
      router.replace('/login');
    } else {
      if (typeof storedUser === 'object' && storedUser !== null) {
        setUser(storedUser as UserData);
      } else {
        router.replace('/login');
        return;
      }
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-gray-50'>
        <p className='text-gray-400'>Cargando sesión...</p>
      </main>
    );
  }

  return (
    <div className='min-h-screen flex'>
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className='flex-1 flex flex-col'>
        <Header user={user} onOpenSidebarMobile={() => setIsMobileSidebarOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
