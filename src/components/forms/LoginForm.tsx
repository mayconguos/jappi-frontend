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
import DeliveryLoader from '@/components/ui/delivery-loader';
import FullScreenDeliveryLoader from '@/components/ui/fullscreen-delivery-loader';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'almacen@japiexpress.com',
      password: 'japientregas24680'
    }
  });

  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerError, setIsServerError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setIsServerError(false);

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
        case 'coordinacion':
          redirectPath = '/dashboard/deliveries-by-date';
          break;
        case 'empresa':
          redirectPath = '/dashboard/company/create-shipment';
          break;
        case 'motorizado':
          redirectPath = '/dashboard/courier/pickups';
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
              setIsServerError(false);
              break;
            case 403:
              setError('Tu cuenta aún no ha sido activada por un administrador. Por favor, espere.');
              setIsServerError(false);
              break;
            case 500:
              setError('Error interno del servidor. Por favor, intenta nuevamente en unos momentos.');
              setIsServerError(true);
              break;
            case 503:
              setError('Servicio no disponible. El servidor está temporalmente fuera de servicio.');
              setIsServerError(true);
              break;
            default:
              setError(`Error del servidor (${axiosError.response.status}). Por favor, contacta al soporte técnico.`);
              setIsServerError(true);
          }
        } else {
          setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
          setIsServerError(true);
        }
      } else {
        // Algo más causó el error
        setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
        setIsServerError(false);
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
        message="Iniciando sesión en Jappi Express..."
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        {/* Campo Email */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <svg
              className="w-4 h-4 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
            Correo electrónico
          </label>
          <Input
            {...register('email')}
            type='email'
            autoComplete='email'
            disabled={isLoading}
            placeholder="tu@email.com"
            className="h-12 text-base rounded-xl border-gray-200 focus:border-[color:var(--button-hover-color)] focus:ring-[color:var(--button-hover-color)] transition-colors"
          />
          {errors.email && (
            <div className="flex items-center text-red-500 text-sm mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email.message}
            </div>
          )}
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <svg
              className="w-4 h-4 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Contraseña
          </label>
          <PasswordInput
            value={watch('password') || ''}
            onChange={(value) => setValue('password', value)}
            placeholder="••••••••"
            disabled={isLoading}
            error={errors.password?.message}
            autoComplete="current-password"
            className="h-12 text-base rounded-xl border-gray-200 focus:border-[color:var(--button-hover-color)] focus:ring-[color:var(--button-hover-color)]"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">{error}</p>
                {isServerError && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError('');
                      setIsServerError(false);
                    }}
                    className="text-red-600 hover:text-red-800 underline text-xs h-auto p-0 mt-2"
                  >
                    Limpiar error
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón Submit */}
        <Button
          type='submit'
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold rounded-xl bg-[color:var(--button-hover-color)] hover:bg-[color:var(--surface-dark)] border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <DeliveryLoader size="sm" message="" className="!space-y-0" />
              <span className="ml-2">Iniciando sesión...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Ingresar
            </div>
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">¿No tienes cuenta?</span>
          </div>
        </div>

        {/* Registro Link */}
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/registro')}
            className="w-full h-12 text-base font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:border-[color:var(--button-hover-color)] hover:text-[color:var(--button-hover-color)] hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Crear cuenta nueva
          </Button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center mt-6 space-y-2">
        <p className="text-xs text-gray-500">
          Al continuar, aceptas nuestros{' '}
          <a
            href="https://drive.google.com/file/d/1MHvTB9t3uQervfF1MYtHC_3nA8oyllcA/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--button-hover-color)] hover:underline transition-colors"
          >
            términos y condiciones
          </a>
        </p>
      </div>
    </div>
  );
}