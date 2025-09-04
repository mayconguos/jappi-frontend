import { z } from 'zod';
import { commonValidations, createDocumentNumberValidator } from './common';
//XANADU faltam esto
export const companySchema = z.object({
  first_name: commonValidations.name,
  last_name: commonValidations.name,
  document_type: commonValidations.documentType,
  document_number: commonValidations.documentNumber,
  email: commonValidations.email,
  password: commonValidations.password,
  id_role: commonValidations.userRole,
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
export const companyEditSchema = z.object({
  first_name: commonValidations.name,
  last_name: commonValidations.name,
  document_type: commonValidations.documentType,
  document_number: commonValidations.documentNumber,
  email: commonValidations.email.optional(),
  password: commonValidations.passwordOptional,
  id_role: commonValidations.userRole,
}).refine((data) => {
  // Validación dinámica del número de documento según el tipo
  const validator = createDocumentNumberValidator(data.document_type);
  const result = validator.safeParse(data.document_number);
  return result.success;
}, {
  message: "Número de documento inválido para el tipo seleccionado",
  path: ["document_number"]
});

export type companyFormData = z.infer<typeof companySchema>;
export type companyEditFormData = z.infer<typeof companyEditSchema>;
