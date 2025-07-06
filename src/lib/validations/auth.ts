import { z } from 'zod';
import { commonValidations, createDocumentNumberValidator } from './common';

export const registerSchema = z.object({
  // Datos personales
  first_name: commonValidations.name,
  last_name: commonValidations.name,
  document_type: commonValidations.documentType,
  document_number: commonValidations.documentNumber,
  type: commonValidations.userType,
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

  district: z
    .number()
    .int()
    .min(1, 'Debes seleccionar un distrito'),

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

  // Cuenta bancaria (solo una para registro)
  accounts: z
    .array(
      z.object({
        account_number: z
          .string()
          .min(10, 'El número de cuenta debe tener al menos 10 dígitos')
          .max(20, 'El número de cuenta no puede exceder 20 dígitos')
          .regex(/^\d+$/, 'El número de cuenta solo puede contener números'),

        account_type: z
          .number()
          .int()
          .min(1, 'Debes seleccionar un tipo de cuenta'),

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
          .min(2, 'El titular de la cuenta debe tener al menos 2 caracteres')
          .max(100, 'El titular de la cuenta no puede exceder 100 caracteres'),

        bank: z
          .number()
          .int()
          .min(1, 'Debes seleccionar un banco')
      })
    )
    .length(1, 'Solo se permite una cuenta bancaria en el registro')
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
});

export const loginSchema = z.object({
  email: commonValidations.email,
  password: commonValidations.passwordRequired,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
