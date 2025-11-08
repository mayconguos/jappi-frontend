import { z } from 'zod';
import { commonValidations, createDocumentNumberValidator } from './common';

const addressSchema = z.object({
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  id_region: z.number().int().min(1, 'Debes seleccionar una región'),
  id_district: z.number().int().min(1, 'Debes seleccionar un distrito'),
  id_sector: z.number().int().min(0, 'Sector inválido').optional(),
});

const bankAccountSchema = z.object({
  account_number: z
    .string()
    .min(10, 'El número de cuenta debe tener al menos 10 dígitos')
    .max(20, 'El número de cuenta no puede exceder 20 dígitos')
    .regex(/^\d+$/, 'Solo se permiten dígitos'),
  account_type: z.number().int(),
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
  bank: z.number().int(),
});

const paymentAppSchema = z.object({
  app_name: z.string().min(2, 'El nombre de la app es obligatorio'),
  phone_number: z
    .string()
    .regex(/^9\d{8}$/, 'El número debe empezar con 9 y tener 9 dígitos'),
  account_holder: z
    .string()
    .min(2, 'El titular de la cuenta debe tener al menos 2 caracteres')
    .max(100, 'El titular de la cuenta no puede exceder 100 caracteres'),
  document_number: z
    .string()
    .regex(/^\d+$/, 'Debe contener solo dígitos')
    .min(8, 'El número de documento debe tener al menos 8 dígitos')
    .max(20, 'El número de documento no puede exceder 20 dígitos')
    .optional(),
});

export const registerSchema = z.object({
  user: z.object({
    first_name: commonValidations.name,
    last_name: commonValidations.name,
    document_type: commonValidations.documentType,
    document_number: commonValidations.documentNumber,
    email: commonValidations.email,
    password: commonValidations.password,
  }),

  company: z.object({
    company_name: z
      .string()
      .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
      .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),

    addresses: z
      .array(addressSchema)
      .min(1, 'Debes registrar al menos una dirección'),

    phones: z
      .array(commonValidations.phone)
      .min(1, 'Debes registrar al menos un número de teléfono'),

    ruc: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (value) => {
          if (!value || value === '') return true; // opcional
          return /^\d{11}$/.test(value);
        },
        'El RUC debe tener exactamente 11 dígitos numéricos'
      ),

    bank_accounts: z.array(bankAccountSchema).optional(),

    payment_apps: z.array(paymentAppSchema).optional(),
  }),
}).superRefine((data, ctx) => {
  // Validar el número de documento según el tipo
  const validator = createDocumentNumberValidator(data.user.document_type);
  const result = validator.safeParse(data.user.document_number);

  if (!result.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error.issues[0]?.message || 'Número de documento inválido',
      path: ['user', 'document_number'],
    });
  }
});

export const loginSchema = z.object({
  email: commonValidations.email,
  password: commonValidations.passwordRequired,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;