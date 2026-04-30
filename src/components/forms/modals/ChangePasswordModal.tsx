'use client';

import { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Modal, { ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useApi } from '@/hooks';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'La confirmación es requerida'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  userEmail: string | undefined;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, userEmail, onClose }: Readonly<ChangePasswordModalProps>) {
  const { put } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!userEmail) {
      setError('Error: Sesión de usuario no encontrada.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Endpoint: PUT /user/password
      const response = await put('/user/password', {
        email: userEmail,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response) {
        setIsSuccess(true);
      } else {
        setError('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al actualizar la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar Contraseña"
      size="sm"
    >
      <div className="py-2">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300 py-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">¡Contraseña Actualizada!</h3>
              <p className="text-sm text-gray-500">
                Tu contraseña ha sido cambiada correctamente. Úsala para tus próximos inicios de sesión.
              </p>
            </div>
            <Button 
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleClose}
            >
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col items-center text-center mb-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mb-3">
                <KeyRound className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-500 px-4">
                Por seguridad, ingresa tu contraseña actual antes de establecer una nueva.
              </p>
            </div>

            <div className="space-y-4">
              <PasswordInput
                label="Contraseña Actual"
                placeholder="••••••••"
                {...register('currentPassword')}
                error={errors.currentPassword?.message}
                disabled={isLoading}
              />

              <div className="h-px bg-gray-100 my-2" />

              <PasswordInput
                label="Nueva Contraseña"
                placeholder="••••••••"
                {...register('newPassword')}
                error={errors.newPassword?.message}
                disabled={isLoading}
              />

              <PasswordInput
                label="Confirmar Nueva Contraseña"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                disabled={isLoading}
              />

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <ModalFooter className="px-0 pt-4 mt-2 border-t border-gray-100">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </ModalFooter>
          </form>
        )}
      </div>
    </Modal>
  );
}
