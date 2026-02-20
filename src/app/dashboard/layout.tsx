'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DeliveryLoader from '@/components/ui/delivery-loader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-gray-50'>
        <DeliveryLoader message="Cargando sesión..." />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <InventoryProvider>
      <div className='h-screen w-full flex overflow-hidden bg-white'>
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className='flex-1 flex flex-col min-w-0 h-full overflow-hidden'>
          <Header onOpenSidebarMobile={() => setIsMobileSidebarOpen(true)} />
          <main className='flex-1 overflow-y-auto bg-slate-50/50 relative custom-scrollbar'>
            {children}
          </main>
        </div>
      </div>
    </InventoryProvider>
  );
}
