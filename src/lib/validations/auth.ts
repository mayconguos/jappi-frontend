import { z } from 'zod';
import { commonValidations, createDocumentNumberValidator } from './common';

export const registerSchema = z.object({
  // Datos personales
  first_name: commonValidations.name,
  last_name: commonValidations.name,
  document_type: commonValidations.documentType,
  document_number: commonValidations.documentNumber,
  email: commonValidations.email,
  password: commonValidations.password,

  // Datos de la empresa
  company_name: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),

  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),

  region: z
    .number()
    .int()
    .min(1, 'Debes seleccionar una región'),

  district: z
    .number()
    .int()
    .min(1, 'Debes seleccionar un distrito'),

  sector: z
    .number()
    .int()
    .min(0, 'Sector inválido')
    .optional(),

  phone: commonValidations.phone,

  latitude: z
    .string()
    .optional(), // Se captura en background

  longitude: z
    .string()
    .optional(), // Se captura en background

  ruc: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value || value === '') return true; // Opcional, puede estar vacío
        return /^\d{11}$/.test(value); // Si se proporciona, debe tener 11 dígitos
      },
      'El RUC debe tener exactamente 11 dígitos numéricos'
    ),

  // App de pagos (opcionales)
  payment_app: z
    .string()
    .optional(),

  payment_phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value || value === '') return true; // Es opcional
        return /^9\d{8}$/.test(value); // Debe empezar con 9 y tener exactamente 9 dígitos
      },
      'El número de celular debe empezar con 9 y tener exactamente 9 dígitos'
    ),

  payment_account_holder: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value || value === '') return true; // Es opcional
        return value.length >= 2 && value.length <= 100;
      },
      'El titular de la cuenta debe tener entre 2 y 100 caracteres'
    ),

  payment_document_number: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value || value === '') return true; // Es opcional
        return /^\d+$/.test(value) && value.length >= 8 && value.length <= 20;
      },
      'El número de documento debe tener entre 8 y 20 dígitos numéricos'
    ),

  // Cuenta bancaria (campos individuales para registro)
  account_number: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value || value === '') return true; // Es opcional si no selecciona banco
        return /^\d{10,20}$/.test(value); // Entre 10 y 20 dígitos
      },
      'El número de cuenta debe tener entre 10 y 20 dígitos numéricos'
    ),

  account_type: z
    .number()
    .int()
    .optional(),

  cci_number: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value || value === '') return true; // Es opcional
        return /^\d{20}$/.test(value); // Si se proporciona, debe tener exactamente 20 dígitos
      },
      'El CCI debe tener exactamente 20 dígitos numéricos'
    ),

  account_holder: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => {
        if (!value || value === '') return true; // Es opcional si no selecciona banco
        return value.length >= 2 && value.length <= 100;
      },
      'El titular de la cuenta debe tener entre 2 y 100 caracteres'
    ),

  bank: z
    .number()
    .int()
    .optional(),
}).superRefine((data, ctx) => {
  // Validación dinámica del número de documento según el tipo
  const validator = createDocumentNumberValidator(data.document_type);
  const result = validator.safeParse(data.document_number);

  if (!result.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error.issues[0]?.message || "Número de documento inválido",
      path: ["document_number"]
    });
  }

  // Nota: La validación del sector se maneja en el componente 
  // basado en si el distrito tiene sectores disponibles
});

export const loginSchema = z.object({
  email: commonValidations.email,
  password: commonValidations.passwordRequired,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
