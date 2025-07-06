import { z } from 'zod';

// Función helper para validar número de documento según tipo
export const createDocumentNumberValidator = (documentType: string) => {
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

// Validaciones compartidas para campos comunes
export const commonValidations = {
  // Nombres y apellidos
  name: z
    .string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/, 'Solo puede contener letras y espacios')
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(50, 'No puede exceder 50 caracteres')
    .refine(value => value.trim().length > 0, 'No puede estar vacío'),

  // Email
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido')
    .max(255, 'El correo es demasiado largo'),

  // Password
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),

  // Password requerida
  passwordRequired: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),

  // Password opcional
  passwordOptional: z
    .string()
    .optional(),

  // Tipo de documento
  documentType: z
    .string()
    .min(1, 'Debes seleccionar un tipo de documento'),

  // Número de documento (se valida dinámicamente)
  documentNumber: z
    .string()
    .min(1, 'El número de documento es requerido'),

  // Tipo de usuario
  userType: z
    .number()
    .int()
    .min(1, 'Debes seleccionar un tipo de usuario'),

  // Teléfono (empresarial - más flexible)
  phone: z
    .string()
    .min(6, 'El teléfono debe tener al menos 6 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[\d\-\+\(\)\s]+$/, 'Solo puede contener números, espacios, guiones y paréntesis')
    .refine(
      (value) => {
        // Contar solo los dígitos
        const digitsOnly = value.replace(/\D/g, '');
        return digitsOnly.length >= 6 && digitsOnly.length <= 15;
      },
      'Debe contener entre 6 y 15 dígitos'
    ),
};

// Función para crear validación de documento con tipo dinámico
export const createDocumentValidation = () => {
  return z.object({
    document_type: commonValidations.documentType,
    document_number: commonValidations.documentNumber,
  }).refine((data) => {
    // Validación dinámica del número de documento según el tipo
    const validator = createDocumentNumberValidator(data.document_type);
    const result = validator.safeParse(data.document_number);
    return result.success;
  }, {
    message: "Número de documento inválido para el tipo seleccionado",
    path: ["document_number"]
  });
};

// Función helper para obtener información de validación de documentos
export const getDocumentValidationInfo = (documentType: string) => {
  switch (documentType) {
    case '1': // DNI
      return {
        maxLength: 8,
        placeholder: "12345678",
        helpText: "Debe tener exactamente 8 dígitos numéricos",
        allowOnlyNumbers: true,
        pattern: /^\d{8}$/
      };
    case '6': // RUC
      return {
        maxLength: 11,
        placeholder: "12345678901",
        helpText: "Debe tener exactamente 11 dígitos numéricos",
        allowOnlyNumbers: true,
        pattern: /^\d{11}$/
      };
    case '4': // Carnet de extranjería
      return {
        maxLength: 12,
        placeholder: "CE123456",
        helpText: "Máximo 12 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9]{1,12}$/
      };
    case '7': // Pasaporte
      return {
        maxLength: 12,
        placeholder: "ABC123456",
        helpText: "Máximo 12 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9]{1,12}$/
      };
    case '0': // Otros
      return {
        maxLength: 15,
        placeholder: "OTROS123",
        helpText: "Máximo 15 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9\-\s]{1,15}$/
      };
    case 'A': // Cédula Diplomática
      return {
        maxLength: 15,
        placeholder: "DIP123456",
        helpText: "Máximo 15 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9\-\s]{1,15}$/
      };
    default:
      return {
        maxLength: 15,
        placeholder: "Número de documento",
        helpText: "Ingrese el número de documento",
        allowOnlyNumbers: false,
        pattern: /^.+$/
      };
  }
};

// Función helper específica para documentos personales (sin RUC)
export const getPersonalDocumentValidationInfo = (documentType: string) => {
  switch (documentType) {
    case '1': // DNI
      return {
        maxLength: 8,
        placeholder: "12345678",
        helpText: "Debe tener exactamente 8 dígitos numéricos",
        allowOnlyNumbers: true,
        pattern: /^\d{8}$/
      };
    case '4': // Carnet de extranjería
      return {
        maxLength: 12,
        placeholder: "CE123456",
        helpText: "Máximo 12 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9]{9,12}$/
      };
    case '7': // Pasaporte
      return {
        maxLength: 12,
        placeholder: "ABC123456",
        helpText: "Máximo 12 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9]{8,12}$/
      };
    case '0': // Otros
      return {
        maxLength: 15,
        placeholder: "OTROS123",
        helpText: "Máximo 15 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9\-\s]{6,15}$/
      };
    case 'A': // Cédula Diplomática
      return {
        maxLength: 15,
        placeholder: "DIP123456",
        helpText: "Máximo 15 caracteres alfanuméricos",
        allowOnlyNumbers: false,
        pattern: /^[A-Za-z0-9\-\s]{1,15}$/
      };
    default:
      return {
        maxLength: 15,
        placeholder: "Número de documento",
        helpText: "Ingrese el número de documento",
        allowOnlyNumbers: false,
        pattern: /^.+$/
      };
  }
};
