import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Encriptar contraseña con bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Error al encriptar contraseña:', error);
    throw new Error('Error en la encriptación de contraseña');
  }
}

/**
 * Verificar contraseña 
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    throw new Error('Error en la verificación de contraseña');
  }
}

/**
 * Validar email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar contraseña
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Requiere al menos 1 letra mayúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Requiere al menos 1 número');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Requiere al menos 1 carácter especial (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
