'use client';

import { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Modal, { ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useApi } from '@/hooks';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: Readonly<ForgotPasswordModalProps>) {
  const { post } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Endpoint: POST /user/forgot-password
      const response = await post('/user/forgot-password', data);
      
      if (response) {
        setIsSuccess(true);
      } else {
        setError('No pudimos procesar tu solicitud. Verifica si el correo es correcto o intenta más tarde.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
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
      title="Recuperar Contraseña"
      size="sm"
    >
      <div className="py-2">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300 py-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">¡Correo enviado!</h3>
              <p className="text-sm text-gray-500">
                Hemos enviado una <span className="font-semibold text-gray-700">contraseña temporal</span> a tu correo electrónico. 
                Revisa tu bandeja de entrada para ingresar nuevamente.
              </p>
            </div>
            <Button 
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20"
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
              <p className="text-sm text-gray-500">
                Ingresa tu correo electrónico y te enviaremos una contraseña temporal para que puedas acceder a tu cuenta.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-lg shadow-emerald-600/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar contraseña
                    <ArrowRight size={16} />
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
