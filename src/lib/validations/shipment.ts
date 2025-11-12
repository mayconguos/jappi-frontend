import { z } from 'zod';
import { commonValidations, createDocumentNumberValidator } from './common';

// Schema para dirección
const addressSchema = z.object({
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  id_region: z
    .number()
    .int()
    .min(1, 'Debes seleccionar una región'),
  id_district: z
    .number()
    .int()
    .min(1, 'Debes seleccionar un distrito'),
  id_sector: z
    .number()
    .int()
    .min(0, 'Sector inválido')
    .optional(),
  reference: z
    .string()
    .max(200, 'La referencia no puede exceder 200 caracteres')
    .optional()
});

// Schema para persona (remitente/destinatario)
const personSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/, 'Solo puede contener letras y espacios'),
  document_type: commonValidations.documentType,
  document_number: commonValidations.documentNumber,
  phone: z
    .string()
    .min(9, 'El teléfono debe tener 9 dígitos')
    .max(9, 'El teléfono debe tener 9 dígitos')
    .regex(/^9\d{8}$/, 'El teléfono debe empezar con 9 y tener 9 dígitos'),
  email: z
    .string()
    .email('Ingresa un correo válido')
    .optional()
    .or(z.literal('')),
  address: addressSchema
});

// Schema para dimensiones del paquete
const dimensionsSchema = z.object({
  length: z
    .number()
    .int()
    .min(1, 'El largo debe ser mayor a 0')
    .max(200, 'El largo no puede exceder 200 cm'),
  width: z
    .number()
    .int()
    .min(1, 'El ancho debe ser mayor a 0')
    .max(200, 'El ancho no puede exceder 200 cm'),
  height: z
    .number()
    .int()
    .min(1, 'El alto debe ser mayor a 0')
    .max(200, 'El alto no puede exceder 200 cm')
});

// Schema para el paquete
const packageSchema = z.object({
  description: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  weight: z
    .number()
    .min(0.1, 'El peso debe ser mayor a 0.1 kg')
    .max(50, 'El peso no puede exceder 50 kg'),
  dimensions: dimensionsSchema,
  declared_value: z
    .number()
    .min(0, 'El valor declarado debe ser mayor o igual a 0')
    .max(10000, 'El valor declarado no puede exceder S/ 10,000'),
  fragile: z.boolean().optional(),
  special_instructions: z
    .string()
    .max(500, 'Las instrucciones no pueden exceder 500 caracteres')
    .optional()
});

// Schema para el servicio
const serviceSchema = z.object({
  origin_type: z
    .string()
    .min(1, 'Debes seleccionar un tipo de envío'),
  type: z
    .string()
    .min(1, 'Debes seleccionar un tipo de servicio'),
  delivery_mode: z
    .string()
    .min(1, 'Debes seleccionar un modo de entrega'),
  delivery_date: z
    .string()
    .min(1, 'Debes seleccionar una fecha de entrega'),
  payment_method: z
    .string()
    .optional(),
  payment_form: z
    .string()
    .optional(),
  collect_on_delivery: z.boolean().optional(),
  cod_amount: z
    .number()
    .min(0, 'El monto debe ser mayor o igual a 0')
    .optional(),
  preferred_pickup_date: z
    .string()
    .optional(),
  preferred_delivery_date: z
    .string()
    .optional(),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
});

// Schema principal del envío
export const shipmentSchema = z.object({
  sender: personSchema,
  recipient: personSchema,
  package: packageSchema,
  service: serviceSchema
}).superRefine((data, ctx) => {
  // Validar el número de documento del remitente según el tipo
  const senderValidator = createDocumentNumberValidator(data.sender.document_type);
  const senderResult = senderValidator.safeParse(data.sender.document_number);
  
  if (!senderResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: senderResult.error.issues[0]?.message || 'Número de documento inválido',
      path: ['sender', 'document_number'],
    });
  }

  // Validar el número de documento del destinatario según el tipo
  const recipientValidator = createDocumentNumberValidator(data.recipient.document_type);
  const recipientResult = recipientValidator.safeParse(data.recipient.document_number);
  
  if (!recipientResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: recipientResult.error.issues[0]?.message || 'Número de documento inválido',
      path: ['recipient', 'document_number'],
    });
  }

  // Validar que si collect_on_delivery es true, cod_amount debe ser mayor a 0
  if (data.service.collect_on_delivery && (!data.service.cod_amount || data.service.cod_amount <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debes especificar un monto mayor a 0 para cobro contra entrega',
      path: ['service', 'cod_amount'],
    });
  }

  // Validar campos de pago solo si el modo de entrega es "contra entrega"
  if (data.service.delivery_mode === 'cod') {
    if (!data.service.payment_method || data.service.payment_method.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar un método de pago',
        path: ['service', 'payment_method'],
      });
    }

    if (!data.service.payment_form || data.service.payment_form.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar una forma de pago',
        path: ['service', 'payment_form'],
      });
    }
  }

  // Validar fechas (opcional)
  if (data.service.preferred_pickup_date && data.service.preferred_delivery_date) {
    const pickupDate = new Date(data.service.preferred_pickup_date);
    const deliveryDate = new Date(data.service.preferred_delivery_date);
    
    if (deliveryDate <= pickupDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de entrega debe ser posterior a la fecha de recojo',
        path: ['service', 'preferred_delivery_date'],
      });
    }
  }
});

export type ShipmentFormData = z.infer<typeof shipmentSchema>;