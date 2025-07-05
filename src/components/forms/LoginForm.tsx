'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import secureLocalStorage from 'react-secure-storage';

import api from '@/app/services/api';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

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
      router.push('/dashboard');
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm w-full space-y-4 bg-white p-6 rounded shadow'>
      <h2 className='text-2xl font-semibold text-center'>Iniciar sesión</h2>

      <div>
        <label className='block mb-1 text-sm font-medium text-gray-700'>Correo</label>
        <Input
          {...register('email')}
          type='email'
          autoComplete='email'
          disabled={isLoading}
          placeholder="Ingresa tu correo electrónico"
        />
        {errors.email && <span className='text-red-500 text-xs mt-1 block'>{errors.email.message}</span>}
      </div>

      <div>
        <PasswordInput
          value={watch('password') || ''}
          onChange={(value) => setValue('password', value)}
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          disabled={isLoading}
          error={errors.password?.message}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className='text-red-600 text-sm text-center p-3 bg-red-50 border border-red-200 rounded-md'>
          {error}
          {isServerError && (
            <div className='mt-2'>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setError('');
                  setIsServerError(false);
                }}
                className='text-blue-600 hover:text-blue-800 underline text-xs h-auto p-0'
              >
                Limpiar error
              </Button>
            </div>
          )}
        </div>
      )}

      <Button
        type='submit'
        disabled={isLoading}
        className='w-full'
        size="lg"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
          </>
        ) : (
          'Ingresar'
        )}
      </Button>

      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          ¿No tienes una cuenta?{' '}
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/registro')}
            className='text-blue-600 hover:text-blue-800 hover:underline font-medium h-auto p-0'
          >
            Regístrate aquí
          </Button>
        </p>
      </div>
    </form>
  );
}