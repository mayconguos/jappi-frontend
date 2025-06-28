export interface RegisterFormData {
  // Datos personales
  nombres: string;
  apellidos: string;
  dni: string;
  password: string;

  // Datos de la empresa
//   nombreEmpresa: string;
//   telefono: string;
//   ruc?: string;
//   direccion: string;
//   distrito: string;
//   banco: string;
//   numeroCuentaBancaria: string;
//   tipoCuentaBancaria: string;

//   // Términos y condiciones
  aceptaTerminos: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  type: number;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
