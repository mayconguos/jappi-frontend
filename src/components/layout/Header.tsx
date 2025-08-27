'use client';

import Image from 'next/image';

import { useAuth } from '@/hooks/useAuth';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { useClickOutside } from '@/hooks/useClickOutside';

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

  const avatarSrc = `/avatars/${user?.id_role || 'default'}.svg`;

  return (
    <header className='bg-[color:var(--background)] shadow p-4 flex justify-between items-center'>
      <div className='flex items-center'>
        <h2 className='text-xl font-semibold text-[color:var(--surface-dark)]'>{pageTitle.toUpperCase()}</h2>
      </div>
      <div className='flex items-center gap-3'>
        {/* Botón hamburguesa: solo visible en móviles */}
        {onOpenSidebarMobile && (
          <button
            onClick={onOpenSidebarMobile}
            className='md:hidden text-gray-600 hover:text-black'
            aria-label='Abrir menú'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
        )}
      </div>

      {/* Avatar y saludo: ocultos en móviles */}
      <div className='relative items-center gap-4 hidden md:flex'>
        <h1 className='text-xl font-semibold text-[color:var(--surface-dark)]'>
          ¡Bienvenido! <span className='text-[color:var(--surface-dark)]'>{user?.name}</span>
        </h1>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className='w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-300 hover:ring-primary transition'
        >
          <Image
            src={avatarSrc}
            alt='Avatar'
            width={40}
            height={40}
            className='object-cover w-full h-full bg-amber-50'
          />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className='absolute right-0 top-12 w-64 bg-white shadow-lg rounded-lg p-4 z-50 text-sm
              before:content-[""] before:absolute before:-top-2 before:right-4
              before:border-8 before:border-transparent before:border-b-white animate-fade-in'
          >
            <button
              className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'
              onClick={() => setShowMenu(false)}
              aria-label='Cerrar menú'
            >
              &times;
            </button>

            <div className='flex flex-col items-center text-center mt-6 mb-4'>
              <Image
                src={avatarSrc}
                alt='Avatar'
                width={60}
                height={60}
                className='rounded-full mb-3 bg-amber-50'
              />
              <p className='text-xl font-semibold text-gray-900'>¡Hola {user?.name}!</p>
              <p className='text-gray-500 text-sm'>{user?.email}</p>
            </div>

            <button
              onClick={logout}
              className='w-full mt-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition'
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
