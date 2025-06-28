'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import secureLocalStorage from 'react-secure-storage';

import api from '@/app/services/api';

type FormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerError, setIsServerError] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError('');
    setIsServerError(false);
    
    try {
      const res = await api.post('/user/login', data);
      const token = res.data.token;
      const user = res.data.user;

      let role;
      switch (user.type) {
        case 1:
          role = 'cliente';
          break;
        case 2:
          role = 'empresa';
          break;
        case 3:
          role = 'motorizado';
          break;
        case 4:
          role = 'almacen';
        case 5:
          role = 'coordinacion';
        default:
          role = '';
      }

      const userWithRole = { ...user, role };
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
        <label className='block mb-1 text-sm'>Correo</label>
        <input
          {...register('email', { required: true })}
          type='email'
          autoComplete='email'
          value='almacen@japiexpress.com'
          disabled={isLoading}
          className='w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed'
        />
        {errors.email && <span className='text-red-500 text-xs'>Este campo es obligatorio</span>}
      </div>

      <div>
        <label className='block mb-1 text-sm'>Contraseña</label>
        <input
          {...register('password', { required: true })}
          type='password'
          autoComplete='current-password'
          value='japientregas24680'
          disabled={isLoading}
          className='w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed'
        />
        {errors.password && <span className='text-red-500 text-xs'>Este campo es obligatorio</span>}
      </div>

      {error && (
        <div className='text-red-600 text-sm text-center'>
          {error}
          {isServerError && (
            <div className='mt-2'>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsServerError(false);
                }}
                className='text-blue-600 hover:text-blue-800 underline text-xs'
              >
                Limpiar error
              </button>
            </div>
          )}
        </div>
      )}

      <button 
        type='submit' 
        disabled={isLoading}
        className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded flex items-center justify-center'
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
      </button>

      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          ¿No tienes una cuenta?{' '}
          <button
            type="button"
            onClick={() => router.push('/registro')}
            className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </form>
  );
}
