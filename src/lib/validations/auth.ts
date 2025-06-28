import { z } from 'zod';

export const registerSchema = z.object({
  // Datos personales
  nombres: z
    .string()
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .max(50, 'Los nombres no pueden exceder 50 caracteres'),
  
  apellidos: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(50, 'Los apellidos no pueden exceder 50 caracteres'),
  
  dni: z
    .string()
    .regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos'),
  
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),

  // Datos de la empresa
  nombreEmpresa: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),
  
  telefono: z
    .string()
    .regex(/^\d{9}$/, 'El teléfono debe tener exactamente 9 dígitos'),
  
  ruc: z
    .string()
    .regex(/^\d{11}$/, 'El RUC debe tener exactamente 11 dígitos')
    .optional()
    .or(z.literal('')),
  
  direccion: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  distrito: z
    .string()
    .min(1, 'Debes seleccionar un distrito'),
  
  banco: z
    .string()
    .min(1, 'Debes seleccionar un banco'),
  
  numeroCuentaBancaria: z
    .string()
    .min(10, 'El número de cuenta debe tener al menos 10 caracteres')
    .max(20, 'El número de cuenta no puede exceder 20 caracteres'),
  
  tipoCuentaBancaria: z
    .string()
    .min(1, 'Debes seleccionar un tipo de cuenta'),

  // Términos y condiciones
  aceptaTerminos: z
    .boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones')
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido')
    .max(255, 'El correo es demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
