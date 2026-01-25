export const REGIONES_LIMA = [
  { label: 'Lima', value: 1 },
  { label: 'Miraflores', value: 2 },
  { label: 'San Isidro', value: 3 },
  { label: 'Surco', value: 4 },
  { label: 'La Molina', value: 5 }
] as const;

export const BANCOS = [
  { label: 'BBVA', value: 1 },
  { label: 'BCP', value: 2 },
  { label: 'Interbank', value: 3 },
  { label: 'Scotiabank', value: 4 }
] as const;

export const TIPOS_CUENTA = [
  { label: 'Cuenta corriente', value: 1 },
  { label: 'Cuenta ahorro', value: 2 },
  { label: 'Cuenta CTS', value: 3 }
] as const;

export const PAYMENT_APPS = [
  { label: 'YAPE', value: 'yape' },
  { label: 'PLIN', value: 'plin' },
];

export const VEHICLE_TYPES = [
  { label: 'MOTOCICLETA', value: 'MOTOCICLETA' },
  { label: 'AUTO', value: 'AUTO' },
  { label: 'BICICLETA', value: 'BICICLETA' },
  { label: 'OTRO', value: 'OTRO' }
] as const;

export const SHIPMENT_ORIGIN_TYPES = [
  { label: 'Envío con recojo', value: 'pickup' },
  { label: 'Envío desde almacén Japi', value: 'warehouse' }
];

export const SHIPMENT_TYPES = [
  { label: 'Regular', value: 'regular' },
  { label: 'Express', value: 'express' },
  { label: 'Cambio', value: 'cambio' }
];

export const DELIVERY_MODES = [
  { label: 'Contra entrega', value: 'pay_on_delivery' },
  { label: 'Solo entrega', value: 'delivery_only' }
];

export const PAYMENT_METHODS = [
  { label: 'Efectivo', value: 'cash' },
  { label: 'Tarjeta', value: 'card' },
  { label: 'Transferencia', value: 'transfer' },
  { label: 'Yape', value: 'yape' },
  { label: 'Plin', value: 'plin' }
];

export const PAYMENT_FORMS = [
  { label: 'Abono a Japi', value: 'japy_payment' },
  { label: 'Abono a vendedor', value: 'seller_payment' },
];
