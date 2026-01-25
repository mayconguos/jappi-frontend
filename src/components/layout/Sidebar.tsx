'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/logo.svg';
import { ChevronLeft, ChevronRight, LogOut, X, User, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { clsx } from 'clsx';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { routes } = useUserRoutes();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'fixed z-50 inset-y-0 left-0 flex flex-col transition-all duration-300 ease-in-out md:static md:z-auto',
          'bg-[#0f172a] border-r border-slate-800/60 text-slate-300 shadow-xl',
          isCollapsed ? 'w-20' : 'w-72',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header / Logo */}
        <div className="h-[4.5rem] flex items-center px-6 py-6 shrink-0 relative">
          <div className={clsx('flex items-center gap-3 transition-opacity duration-300 overflow-hidden', isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full')}>
            <Logo className="w-10 h-10 text-[#02997d] shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="text-xl leading-none text-white overflow-hidden whitespace-nowrap">
                <span className="font-bold">Japi</span>
                <span className="font-light ml-1">Express</span>
              </span>
            </div>
          </div>

          {/* Centered Logo for Collapsed State */}
          <div className={clsx('absolute left-1/2 -translate-x-1/2 transition-all duration-300', isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-50')}>
            <Logo className="w-10 h-10 text-[#02997d]" />
          </div>

          {/* Close Mobile */}
          <button
            onClick={onMobileClose}
            className="md:hidden ml-auto text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Separator - Subtle gradient */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-6" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2 custom-scrollbar">
          {routes.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onMobileClose}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 shadow-sm shadow-blue-500/5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
                  isCollapsed ? 'justify-center' : 'justify-start'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={clsx('shrink-0 transition-colors duration-200', isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-200')}
                />

                {!isCollapsed && (
                  <span className={clsx('ml-3 font-medium text-sm transition-all', isActive ? 'text-blue-100' : '')}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 shrink-0">

          {/* Collapse Toggle (Integrated style) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={clsx(
              'hidden md:flex items-center w-full mb-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 group',
              isCollapsed ? 'justify-center' : 'gap-3 px-3'
            )}
            title={isCollapsed ? 'Expandir' : 'Colapsar menú'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}

            {!isCollapsed && (
              <span className="font-medium text-sm">Colapsar menú</span>
            )}
          </button>

          <div className={clsx(
            'flex items-center transition-all duration-300',
            isCollapsed ? 'justify-center' : 'gap-3 px-2'
          )}>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 text-white font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>

            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user?.email || 'admin@jappi.com'}
                </p>
              </div>
            )}

            {/* Actions / Logout */}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          {/* Collapsed Logout separate button */}
          {isCollapsed && (
            <button
              onClick={logout}
              className="mt-4 w-full flex justify-center p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
