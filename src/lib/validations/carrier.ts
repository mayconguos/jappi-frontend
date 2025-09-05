import { z } from 'zod';
import { commonValidations } from './common';

export const carrierSchema = z.object({
  document_number: commonValidations.documentNumber,
  document_type: commonValidations.documentType,
  email: commonValidations.email,
  first_name: commonValidations.name,
  last_name: commonValidations.name,
  license: z
    .string()
    .regex(/^[A-Za-z0-9]{8,12}$/, 'La licencia debe ser alfanumérica y tener entre 8 y 12 caracteres'),
  brand: z
    .string()
    .max(100, 'La marca no puede tener más de 100 caracteres'),
  model: z
    .string()
    .max(100, 'El modelo no puede tener más de 100 caracteres'),
  plate_number: z
    .string()
    .regex(/^[A-Za-z0-9-]{6,8}$/, 'El número de placa debe ser alfanumérico, puede incluir guiones y tener entre 6 y 8 caracteres'),
  vehicle_type: z.enum(['MOTOCICLETA', 'AUTO', 'BICICLETA', 'OTRO'], {
    errorMap: () => ({ message: 'Tipo de vehículo inválido' })
  }),
  password: commonValidations.password,
  status: z.number().min(0).optional(),
  id_role: commonValidations.userRole
});

// Schema para edición (email y password opcionales)
export const carrierEditSchema = z.object({
  document_number: commonValidations.documentNumber,
  document_type: commonValidations.documentType,
  email: commonValidations.email.optional(),
  first_name: commonValidations.name.optional(),
  last_name: commonValidations.name.optional(),
  license: z
    .string()
    .regex(/^[A-Za-z0-9]{8,12}$/, 'La licencia debe ser alfanumérica y tener entre 8 y 12 caracteres'),
  brand: z.string().max(100, 'La marca no puede tener más de 100 caracteres'),
  model: z
    .string()
    .max(100, 'El modelo no puede tener más de 100 caracteres'),
  plate_number: z
    .string()
    .regex(/^[A-Za-z0-9-]{6,8}$/, 'El número de placa debe ser alfanumérico, puede incluir guiones y tener entre 6 y 8 caracteres'),
  vehicle_type: z.enum(['MOTOCICLETA', 'AUTO', 'BICICLETA', 'OTRO'], {
    errorMap: () => ({ message: 'Tipo de vehículo inválido' })
  }),
  status: z.number().min(0).optional(),
  id_role: commonValidations.userRole
});

export type CarrierFormData = z.infer<typeof carrierSchema>;
export type CarrierEditFormData = z.infer<typeof carrierEditSchema>;
