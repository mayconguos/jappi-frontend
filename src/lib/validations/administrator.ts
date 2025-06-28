import { z } from 'zod';

// Función helper para validar número de documento según tipo
const createDocumentNumberValidator = (documentType: string) => {
  switch (documentType) {
    case '1': // DNI
      return z.string().regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos numéricos');
    case '6': // RUC
      return z.string().regex(/^\d{11}$/, 'El RUC debe tener exactamente 11 dígitos numéricos');
    case '4': // Carnet de extranjería
      return z.string().regex(/^[A-Za-z0-9]{1,12}$/, 'El Carnet de extranjería debe tener máximo 12 caracteres alfanuméricos');
    case '7': // Pasaporte
      return z.string().regex(/^[A-Za-z0-9]{1,12}$/, 'El Pasaporte debe tener máximo 12 caracteres alfanuméricos');
    case '0': // Otros
      return z.string().regex(/^[A-Za-z0-9\-\s]{1,15}$/, 'El documento debe tener máximo 15 caracteres alfanuméricos');
    case 'A': // Cédula Diplomática
      return z.string().regex(/^[A-Za-z0-9\-\s]{1,15}$/, 'La Cédula Diplomática debe tener máximo 15 caracteres alfanuméricos');
    default:
      return z.string().min(1, 'El número de documento es requerido');
  }
};

export const administratorSchema = z.object({
  first_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .refine(value => value.trim().length > 0, 'El nombre no puede estar vacío'),

  last_name: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .refine(value => value.trim().length > 0, 'El apellido no puede estar vacío'),

  document_type: z
    .string()
    .min(1, 'El tipo de documento es requerido'),

  document_number: z
    .string()
    .min(1, 'El número de documento es requerido'),

  email: z
    .string()
    .email('El correo electrónico no es válido')
    .max(255, 'El correo electrónico es demasiado largo'),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),

  type: z
    .number()
    .min(1, 'El tipo de usuario es requerido')
}).refine((data) => {
  // Validación dinámica del número de documento según el tipo
  const validator = createDocumentNumberValidator(data.document_type);
  const result = validator.safeParse(data.document_number);
  return result.success;
}, {
  message: "Número de documento inválido para el tipo seleccionado",
  path: ["document_number"]
});

// Schema para edición (email y password opcionales)
export const administratorEditSchema = z.object({
  first_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .refine(value => value.trim().length > 0, 'El nombre no puede estar vacío'),

  last_name: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .refine(value => value.trim().length > 0, 'El apellido no puede estar vacío'),

  document_type: z
    .string()
    .min(1, 'El tipo de documento es requerido'),

  document_number: z
    .string()
    .min(1, 'El número de documento es requerido'),

  email: z
    .string()
    .email('El correo electrónico no es válido')
    .max(255, 'El correo electrónico es demasiado largo')
    .optional(),

  password: z
    .string()
    .optional(),

  type: z
    .number()
    .min(1, 'El tipo de usuario es requerido')
}).refine((data) => {
  // Validación dinámica del número de documento según el tipo
  const validator = createDocumentNumberValidator(data.document_type);
  const result = validator.safeParse(data.document_number);
  return result.success;
}, {
  message: "Número de documento inválido para el tipo seleccionado",
  path: ["document_number"]
});

export type AdministratorFormData = z.infer<typeof administratorSchema>;
export type AdministratorEditFormData = z.infer<typeof administratorEditSchema>;
