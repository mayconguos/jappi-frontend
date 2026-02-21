'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import secureLocalStorage from 'react-secure-storage';

import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import FullScreenDeliveryLoader from '@/components/ui/fullscreen-delivery-loader';

export default function LoginForm() {
  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      // ------ Administrador ------
      // email: 'almacen@japiexpress.com',
      // password: 'japientregas24680'
      // ------ Cliente ------
      email: 'velia.guerra@gmail.com',
      password: 'administracion2015'
      // ------ Motorizado ------
      // email: 'lionelramos@japiexpress.com',
      // password: 'lionelramos'
      // ------ Almacen ------
      // email: 'almacen.2@japiexpress.com',
      // password: 'japientregas24680'
    }
  });

  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data);
      // Redirection is handled in AuthContext
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status: number } };
        if (axiosError.response) {
          switch (axiosError.response.status) {
            case 401:
              setError('Credenciales inválidas. Verifica tu correo y contraseña.');
              break;
            case 403:
              setError('Tu cuenta aún no ha sido activada por un administrador. Por favor, espere.');
              break;
            case 500:
              setError('Error interno del servidor. Por favor, intenta nuevamente en unos momentos.');
              break;
            case 503:
              setError('Servicio no disponible. El servidor está temporalmente fuera de servicio.');
              break;
            default:
              setError(`Error del servidor (${axiosError.response.status}). Por favor, contacta al soporte técnico.`);
          }
        } else {
          setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        }
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already logged in (optional, but good UX to prevent showing form if session exists)
  useEffect(() => {
    const user = secureLocalStorage.getItem('user');
    if (user) {
      router.replace('/dashboard');
    }
  }, [router]);

  if (isLoading) {
    return (
      <FullScreenDeliveryLoader
        isVisible={true}
        message="Iniciando sesión en Japi Express..."
      />
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="nombre@empresa.com"
            autoComplete="email"
            disabled={isLoading}
            value={watch('email') || ''}
            onChange={(e) => setValue('email', e.target.value)}
            error={errors.email?.message}
          />

          <div>
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              value={watch('password') || ''}
              onChange={(e) => setValue('password', e.target.value)}
              disabled={isLoading}
              error={errors.password?.message}
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-2">
              <a
                href="#"
                className="text-sm font-medium text-[#02997d] hover:text-[#027d66] hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            type='submit'
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full font-semibold text-base shadow-lg shadow-[#02997d]/20 hover:shadow-[#02997d]/30 transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Ingresando...</span>
              </div>
            ) : (
              'Ingresar'
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="font-medium text-[#02997d] hover:text-[#027d66] hover:underline transition-colors"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </form>

    </div>
  );
}