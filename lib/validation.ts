/**
 * Utilidades para validación y seguridad de formularios
 */

export const passwordValidation = {
  minLength: 8,
  requiresUppercase: true,
  requiresNumber: true,
  requiresSpecialChar: true,
  specialChars: '@$!%*?&'
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < passwordValidation.minLength) {
    errors.push(`La contraseña debe tener mínimo ${passwordValidation.minLength} caracteres`);
  }

  if (passwordValidation.requiresUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos 1 letra mayúscula');
  }

  if (passwordValidation.requiresNumber && !/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos 1 número');
  }

  if (passwordValidation.requiresSpecialChar && 
      !new RegExp(`[${passwordValidation.specialChars}]`).test(password)) {
    errors.push(`La contraseña debe contener al menos 1 carácter especial (${passwordValidation.specialChars})`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 50;
};
