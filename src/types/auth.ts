export interface RegisterFormData {
  // Datos personales
  nombres: string;
  apellidos: string;
  dni: string;
  password: string;

  // Términos y condiciones
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