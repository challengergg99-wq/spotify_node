import { expect, test } from 'vitest';
import { validateEmail, validateName, validatePassword } from '../lib/validation';

test('validatePassword accepts a password meeting every requirement', () => {
  expect(validatePassword('Musica123!')).toEqual({ isValid: true, errors: [] });
});

test('validatePassword reports each missing requirement', () => {
  expect(validatePassword('abc')).toEqual({
    isValid: false,
    errors: [
      'La contraseña debe tener mínimo 8 caracteres',
      'La contraseña debe contener al menos 1 letra mayúscula',
      'La contraseña debe contener al menos 1 número',
      'La contraseña debe contener al menos 1 carácter especial (@$!%*?&)',
    ],
  });
});

test('validatePassword rejects passwords missing each requirement individually', () => {
  const cases = [
    ['Music1!', 'La contraseña debe tener mínimo 8 caracteres'],
    ['musica123!', 'La contraseña debe contener al menos 1 letra mayúscula'],
    ['Musicaaaaa!', 'La contraseña debe contener al menos 1 número'],
    ['Musica123#', 'La contraseña debe contener al menos 1 carácter especial (@$!%*?&)'],
  ];

  for (const [password, error] of cases) {
    expect(validatePassword(password).errors).toEqual([error]);
  }
});

test('validatePassword accepts every configured special character', () => {
  for (const specialChar of '@$!%*?&') {
    expect(validatePassword(`Musica123${specialChar}`).isValid).toBe(true);
  }
});

test('validateEmail accepts a standard address', () => {
  expect(validateEmail('persona@example.com')).toBe(true);
});

test('validateEmail rejects missing parts and whitespace', () => {
  for (const email of ['sin-arroba.example.com', 'persona@', '@example.com', 'persona @example.com']) {
    expect(validateEmail(email), `Debe rechazar ${email}`).toBe(false);
  }
});

test('validateName trims whitespace and accepts names up to 50 characters', () => {
  expect(validateName('  Ana  ')).toBe(true);
  expect(validateName('a'.repeat(50))).toBe(true);
});

test('validateName rejects blank names and names longer than 50 characters', () => {
  expect(validateName('   ')).toBe(false);
  expect(validateName('a'.repeat(51))).toBe(false);
});
