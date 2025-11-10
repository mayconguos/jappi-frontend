export const REGISTRATION_STEPS = [
  { 
    number: 1, 
    title: 'Datos personales', 
    description: 'Información personal y credenciales' 
  },
  { 
    number: 2, 
    title: 'Datos de la empresa', 
    description: 'Información de tu empresa' 
  },
  { 
    number: 3, 
    title: 'Método de pago', 
    description: 'Elige cómo recibir tus pagos' 
  }
];

export const TOTAL_STEPS = REGISTRATION_STEPS.length;

export const REGISTRATION_FORM_DEFAULT_VALUES = {
  user: {
    first_name: '',
    last_name: '',
    document_type: '',
    document_number: '',
    email: '',
    password: ''
  },
  company: {
    company_name: '',
    addresses: [{
      address: '',
      id_region: 0,
      id_district: 0,
      id_sector: 0
    }],
    phones: [''],
    ruc: '',
    bank_accounts: [{
      account_number: '',
      account_type: 0,
      cci_number: '',
      account_holder: '',
      bank: 0
    }],
    payment_apps: [{
      app_name: '',
      phone_number: '',
      account_holder: '',
      document_number: ''
    }]
  }
};