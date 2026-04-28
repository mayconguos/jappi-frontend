'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { isPathAllowed, getRedirectPathForUser } from '@/utils/roleUtils';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

import DeliveryLoader from '@/components/ui/delivery-loader';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user && !isPathAllowed(pathname, user.id_role)) {
        // Redirigir a la ruta por defecto de su rol si intenta entrar a una prohibida
        const redirectPath = getRedirectPathForUser(user.id_role);
        router.replace(redirectPath);
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-gray-50'>
        <DeliveryLoader message="Cargando sesión..." />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  const isAuthorized = isAuthenticated && user && isPathAllowed(pathname, user.id_role);

  return (
    <div className='h-screen w-full flex overflow-hidden bg-white'>
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className='flex-1 flex flex-col min-w-0 h-full overflow-hidden'>
        <Header onOpenSidebarMobile={() => setIsMobileSidebarOpen(true)} />
        <main className='flex-1 overflow-y-auto bg-slate-50/50 relative custom-scrollbar'>
          {isAuthorized ? children : (
            <div className='flex items-center justify-center h-full'>
              <DeliveryLoader message="Verificando acceso..." />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
