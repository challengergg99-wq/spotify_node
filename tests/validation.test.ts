import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEmail, validateName, validatePassword } from '../lib/validation';

test('validatePassword accepts a password meeting every requirement', () => {
  assert.deepEqual(validatePassword('Musica123!'), { isValid: true, errors: [] });
});

test('validatePassword reports each missing requirement', () => {
  assert.deepEqual(validatePassword('abc'), {
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
    assert.deepEqual(validatePassword(password).errors, [error]);
  }
});

test('validatePassword accepts every configured special character', () => {
  for (const specialChar of '@$!%*?&') {
    assert.equal(validatePassword(`Musica123${specialChar}`).isValid, true);
  }
});

test('validateEmail accepts a standard address', () => {
  assert.equal(validateEmail('persona@example.com'), true);
});

test('validateEmail rejects missing parts and whitespace', () => {
  for (const email of ['sin-arroba.example.com', 'persona@', '@example.com', 'persona @example.com']) {
    assert.equal(validateEmail(email), false, `Debe rechazar ${email}`);
  }
});

test('validateName trims whitespace and accepts names up to 50 characters', () => {
  assert.equal(validateName('  Ana  '), true);
  assert.equal(validateName('a'.repeat(50)), true);
});

test('validateName rejects blank names and names longer than 50 characters', () => {
  assert.equal(validateName('   '), false);
  assert.equal(validateName('a'.repeat(51)), false);
});
