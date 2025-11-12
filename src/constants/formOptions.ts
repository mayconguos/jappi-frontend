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
  { label: 'Lukita', value: 'lukita' },
  { label: 'Agora Pay', value: 'agora' }
];

export const VEHICLE_TYPES = [
  { label: 'MOTOCICLETA', value: 'MOTOCICLETA' },
  { label: 'AUTO', value: 'AUTO' },
  { label: 'BICICLETA', value: 'BICICLETA' },
  { label: 'OTRO', value: 'OTRO' }
] as const;
