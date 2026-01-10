'use client';

import { Shield, Building, Bike, Boxes, Workflow, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { useClickOutside } from '@/hooks/useClickOutside';
import { clsx } from 'clsx';

interface UserData {
  id: number;
  email: string;
  name: string;
  id_role: number;
}

interface HeaderProps {
  user: UserData | null;
  onOpenSidebarMobile?: () => void;
}

export default function Header({ user, onOpenSidebarMobile }: HeaderProps) {
  const { logout } = useAuth();
  const { pageTitle } = useUserRoutes();
  const { isOpen: showMenu, setIsOpen: setShowMenu, ref: menuRef } = useClickOutside<HTMLDivElement>();

  const getAvatarIcon = (id_role: number | undefined) => {
    switch (id_role) {
      case 1:
        return <Shield className='w-6 h-6 text-blue-600' />;
      case 2:
        return <Building className='w-6 h-6 text-blue-600' />;
      case 3:
        return <Bike className='w-6 h-6 text-blue-600' />;
      case 4:
        return <Boxes className='w-6 h-6 text-blue-600' />;
      case 5:
        return <Workflow className='w-6 h-6 text-blue-600' />;
      default:
        return <User className='w-6 h-6 text-blue-600' />;
    }
  };

  return (
    <header className='sticky top-0 z-30 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex justify-between items-center transition-all'>
      <div className='flex items-center gap-4'>
        {/* Mobile Toggle */}
        {onOpenSidebarMobile && (
          <button
            onClick={onOpenSidebarMobile}
            className='md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100'
            aria-label='Abrir menú'
          >
            <Menu size={24} />
          </button>
        )}

        <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
          {pageTitle}
        </h2>
      </div>

      {/* User Actions */}
      <div className='flex items-center gap-4' ref={menuRef}>
        <div className='relative'>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={clsx(
              'flex items-center gap-3 p-1.5 pr-3 rounded-full border transition-all duration-200',
              showMenu ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            )}
          >
            <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center'>
              {getAvatarIcon(user?.id_role)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-700 leading-none">{user?.name?.split(' ')[0]}</p>
            </div>
          </button>

          {/* Dropdown User Menu */}
          {showMenu && (
            <div className='absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2'>
              {/* User Info Header */}
              <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                <p className='text-sm font-semibold text-slate-900'>Cuenta Activa</p>
                <p className='text-xs text-slate-500 truncate'>{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {/* Here we can add Link to Profile later */}

                <div className="px-2 py-2">
                  <div className="h-px bg-gray-100 my-1" />
                </div>

                <button
                  onClick={logout}
                  className='w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
