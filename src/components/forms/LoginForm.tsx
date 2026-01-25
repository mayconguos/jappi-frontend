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
      email: 'almacen@japiexpress.com',
      password: 'japientregas24680'
      // email: 'velia.guerra@gmail.com',
      // password: 'administracion2015'
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="Ingresa tu correo"
          autoComplete="email"
          disabled={isLoading}
          value={watch('email') || ''}
          onChange={(e) => setValue('email', e.target.value)}
          error={errors.email?.message}
        />

        <div>
          <PasswordInput
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={watch('password') || ''}
            onChange={(e) => setValue('password', e.target.value)}
            disabled={isLoading}
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-2">
            <a href="#" className="text-sm font-medium text-[#00A9C1] hover:text-[color:var(--surface-dark)] transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
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

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          <Button
            type="button"
            variant="link"
            onClick={() => router.push('/register')}
            className="text-sm font-medium text-gray-500 hover:text-[color:var(--surface-dark)] transition-colors order-2 md:order-1 gap-1"
          >
            ¿No tienes cuenta? <span className="underline font-bold">Regístrate</span>
          </Button>

          <Button
            type='submit'
            disabled={isLoading}
            className="w-full md:w-auto px-10 order-1 md:order-2"
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
        </div>
      </form>

      <div className="mt-12 text-center border-t border-gray-100 pt-6">
        <p className="text-xs text-gray-400">
          Al iniciar sesión, aceptas nuestros{' '}
          <a
            href="https://drive.google.com/file/d/1MHvTB9t3uQervfF1MYtHC_3nA8oyllcA/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            Términos y Condiciones
          </a>.
        </p>
      </div>
    </div>
  );
}