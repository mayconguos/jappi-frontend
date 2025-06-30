'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { DISTRITOS_LIMA, BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components//ui/checkbox';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const watchedValues = watch();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('Datos del formulario:', data);
      // Aquí iría la lógica para enviar los datos al servidor
    } catch (error) {
      console.error('Error al registrar:', error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Registro
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Personales */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Datos Personales</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres *
              </label>
              <Input
                {...register('nombres')}
                type="text"
                placeholder="Ingresa tus nombres"
              />
              {errors.nombres && (
                <p className="text-red-500 text-sm mt-1">{errors.nombres.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <Input
                {...register('apellidos')}
                type="text"
                placeholder="Ingresa tus apellidos"
              />
              {errors.apellidos && (
                <p className="text-red-500 text-sm mt-1">{errors.apellidos.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI *
              </label>
              <Input
                {...register('dni')}
                type="text"
                placeholder="12345678"
                maxLength={8}
              />
              {errors.dni && (
                <p className="text-red-500 text-sm mt-1">{errors.dni.message}</p>
              )}
            </div>

            <div>
              <PasswordInput
                {...register('password')}
                value={watchedValues.password || ''}
                onChange={(value) => setValue('password', value)}
                label="Contraseña *"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
              />
            </div>
          </div>
        </div>

        {/* Datos de la Empresa */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Datos de la Empresa</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa *
              </label>
              <Input
                {...register('nombreEmpresa')}
                type="text"
                placeholder="Nombre de tu empresa"
              />
              {errors.nombreEmpresa && (
                <p className="text-red-500 text-sm mt-1">{errors.nombreEmpresa.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <Input
                {...register('direccion')}
                type="text"
                placeholder="Av. Ejemplo 123, Oficina 456"
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Distrito *"
                value={watchedValues.distrito || ''}
                onChange={(value) => setValue('distrito', value)}
                options={[...DISTRITOS_LIMA]}
              />
              {errors.distrito && (
                <p className="text-red-500 text-sm mt-1">{errors.distrito.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                {...register('telefono')}
                type="text"
                placeholder="987654321"
                maxLength={9}
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUC (opcional)
              </label>
              <Input
                {...register('ruc')}
                type="text"
                placeholder="12345678901"
                maxLength={11}
              />
              {errors.ruc && (
                <p className="text-red-500 text-sm mt-1">{errors.ruc.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Banco *"
                value={watchedValues.banco || ''}
                onChange={(value) => setValue('banco', value)}
                options={[...BANCOS]}
              />
              {errors.banco && (
                <p className="text-red-500 text-sm mt-1">{errors.banco.message}</p>
              )}
            </div>

            <div>
              <Select
                label="Tipo de Cuenta *"
                value={watchedValues.tipoCuentaBancaria || ''}
                onChange={(value) => setValue('tipoCuentaBancaria', value)}
                options={[...TIPOS_CUENTA]}
              />
              {errors.tipoCuentaBancaria && (
                <p className="text-red-500 text-sm mt-1">{errors.tipoCuentaBancaria.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cuenta *
              </label>
              <Input
                {...register('numeroCuentaBancaria')}
                type="text"
                placeholder="1234567890123456"
                maxLength={20}
              />
              {errors.numeroCuentaBancaria && (
                <p className="text-red-500 text-sm mt-1">{errors.numeroCuentaBancaria.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div>
          <Checkbox
            checked={watchedValues.aceptaTerminos || false}
            onChange={(checked) => setValue('aceptaTerminos', checked)}
            label={
              <span>
                Acepto los{' '}
                <a
                  href="https://drive.google.com/file/d/1MHvTB9t3uQervfF1MYtHC_3nA8oyllcA/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  términos y condiciones
                </a>
                {' '}*
              </span>
            }
          />
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Nota:</span> Debes aceptar los términos y condiciones para acceder al sistema Japi.
            </p>
          </div>
          {errors.aceptaTerminos && (
            <p className="text-red-500 text-sm mt-1">{errors.aceptaTerminos.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>
    </div>
  );
}