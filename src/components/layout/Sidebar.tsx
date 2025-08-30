'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/logo.svg';

import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useUserRoutes } from '@/hooks/useUserRoutes';

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
      {/* Fondo oscuro al abrir en móvil */}
      {isMobileOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity animate-fade-in'
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed z-50 inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
          bg-[color:var(--surface-dark)] text-white flex flex-col justify-between
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex
        `}
      >
        <div>
          {/* Logo y botones */}
          <div className='flex items-center justify-between px-4 py-4 border-b border-white/10'>
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <Logo className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'}`} />
              {!isCollapsed && <span className='font-bold text-lg'>Japi Express</span>}
            </div>

            {/* Cerrar mobile */}
            <button
              onClick={onMobileClose}
              className='block md:hidden text-white'
              title='Cerrar menú'
            >
              <X size={18} />
            </button>
          </div>

          {/* Rutas */}
          <nav className='flex flex-col mt-4 space-y-1 px-2 relative'>
            {routes.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={item.label}
                  onClick={onMobileClose}
                  className={`flex items-center px-4 py-2 rounded text-sm font-medium transition-all duration-300
                    ${isActive ? 'bg-white text-black' : 'hover:bg-white/10 hover:translate-x-1'}
                    ${isCollapsed ? 'justify-center' : 'gap-3'}
                  `}
                >
                  <Icon size={18} />
                  {!isCollapsed && (
                    <span
                      className={`transition-opacity duration-300 ease-in-out ${isCollapsed ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Collapse en desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-white text-black hover:bg-gray-300 transition-all duration-500 cursor-pointer p-2 rounded-full shadow-md
                ${isCollapsed ? 'hover:rotate-180' : 'hover:rotate-0'}`}
              title={isCollapsed ? 'Expandir' : 'Colapsar'}
            >
              {isCollapsed ? (
                <ChevronRight className='scale-100 transition-transform duration-500' size={20} />
              ) : (
                <ChevronLeft className='scale-100 transition-transform duration-500' size={20} />
              )}
            </button>
          </nav>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={logout}
          className={`w-full px-4 py-3 text-sm flex items-center gap-2 hover:bg-white/10 border-t border-white/10 transition-all
            ${isCollapsed ? 'justify-center' : ''}`}
          title='Cerrar sesión'
        >
          <LogOut size={18} />
          {!isCollapsed && 'Cerrar sesión'}
        </button>
      </aside>
    </>
  );
}
