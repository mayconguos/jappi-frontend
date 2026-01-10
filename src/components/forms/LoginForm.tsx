'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import secureLocalStorage from 'react-secure-storage';

import api from '@/app/services/api';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { getRoleNameFromNumber } from '@/utils/roleUtils';

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
      // email: 'almacen@japiexpress.com',
      // password: 'japientregas24680'
      email: 'velia.guerra@gmail.com',
      password: 'administracion2015'
    }
  });

  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/user/login', data);
      const token = res.data.token;
      const user = res.data.user;
      const userWithRole = { ...user };
      localStorage.setItem('token', token);
      secureLocalStorage.setItem('user', userWithRole);

      // Determine the role and redirect accordingly
      const role = getRoleNameFromNumber(user.id_role);
      let redirectPath = '/dashboard';

      switch (role) {
        case 'admin':
          redirectPath = '/dashboard/activations';
          break;
        case 'coordinacion':
          redirectPath = '/dashboard/deliveries-by-date';
          break;
        case 'empresa':
          redirectPath = '/dashboard/company/create-shipment';
          break;
        case 'transportista':
          redirectPath = '/dashboard/carrier/pickups';
          break;
        case 'almacen':
          redirectPath = '/dashboard/warehouse-requests';
          break;
        default:
          redirectPath = '/dashboard';
      }

      setIsRedirecting(true);
      router.push(redirectPath);
    } catch (err: unknown) {
      // Type guard para verificar si es un error de axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status: number } };
        if (axiosError.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
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
        // Algo más causó el error
        setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Si ya hay usuario autenticado, redirigir inmediatamente y mostrar solo el loader
  useEffect(() => {
    const user = secureLocalStorage.getItem('user');
    if (user) {
      setIsRedirecting(true);
      router.push('/dashboard');
    }
  }, [router]);

  // Si está autenticando o redirigiendo, mostrar solo el loader de pantalla completa
  if (isLoading || isRedirecting) {
    return (
      <FullScreenDeliveryLoader
        isVisible={true}
        message="Iniciando sesión en Japi Express..."
      />
    );
  }

  return (
    <div className="w-full">
      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Campo Email */}
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="Ingresa tu correo"
          autoComplete="email"
          disabled={isLoading}
          value={watch('email') || ''}
          onChange={(value: string) => setValue('email', value)}
          error={errors.email?.message}
        />

        {/* Campo Contraseña */}
        <div>
          <PasswordInput
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={watch('password') || ''}
            onChange={(value: string) => setValue('password', value)}
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

        {/* Error Message */}
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

        {/* Botones de acción */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          {/* Crear cuenta (Link secundario) */}
          <Button
            type="button"
            variant="link"
            onClick={() => router.push('/register')}
            className="text-sm font-medium text-gray-500 hover:text-[color:var(--surface-dark)] transition-colors order-2 md:order-1 gap-1"
          >
            ¿No tienes cuenta? <span className="underline font-bold">Regístrate</span>
          </Button>

          {/* Botón Ingresar (Principal) */}
          <Button
            type='submit'
            shape="pill"
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

      {/* Footer Legal Extra Small */}
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