'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/logo.svg';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { clsx } from 'clsx';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { routes } = useUserRoutes();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'fixed z-50 inset-y-0 left-0 flex flex-col transition-all duration-300 ease-in-out md:static md:z-auto',
          'bg-slate-900 border-r border-slate-800 text-slate-300 shadow-xl',
          isCollapsed ? 'w-20' : 'w-72',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50 shrink-0">
          <div className={clsx('flex items-center gap-3 transition-all duration-300', isCollapsed && 'justify-center w-full')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20 text-white shrink-0">
              <Logo className="w-6 h-6 text-white fill-current" />
            </div>

            <div className={clsx('flex flex-col overflow-hidden transition-all duration-300', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
              <span className="font-bold text-white text-lg leading-none tracking-tight">Japi Express</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">Dashboard</span>
            </div>
          </div>

          {/* Close Mobile */}
          <button
            onClick={onMobileClose}
            className="md:hidden ml-auto text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1 custom-scrollbar">
          {routes.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onMobileClose}
                className={clsx(
                  'flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                  isCollapsed ? 'justify-center' : 'justify-start'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={clsx('shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')}
                />

                {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm truncate">
                    {item.label}
                  </span>
                )}

                {/* Active Indicator for Collapsed Mode */}
                {isCollapsed && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer / User / Logout */}
        <div className="p-4 border-t border-slate-800/50 shrink-0">
          <button
            onClick={logout}
            className={clsx(
              'flex items-center w-full p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group',
              isCollapsed ? 'justify-center' : ''
            )}
            title="Cerrar Sesión"
          >
            <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {!isCollapsed && <span className="ml-3 font-medium text-sm">Cerrar Sesión</span>}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-24 w-6 h-6 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-full items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors shadow-xl z-50"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
