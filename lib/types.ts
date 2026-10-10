/**
 * Tipos TypeScript para la aplicación
 */

export interface User {
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterFormData {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface RegisterResponse extends ApiResponse {
  user?: User;
}
