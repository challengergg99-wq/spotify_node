import { describe, it, expect } from 'vitest';
import { signSession, verifySession } from '@/lib/auth';

const payload = { userId: 1, nombre: 'Test', correo: 'test@example.com', isAdmin: false };

describe('sesión JWT', () => {
  it('firma un token y lo verifica devolviendo los mismos datos', async () => {
    const token = await signSession(payload);
    const session = await verifySession(token);

    expect(session?.userId).toBe(1);
    expect(session?.correo).toBe('test@example.com');
    expect(session?.isAdmin).toBe(false);
  });

  it('conserva el flag isAdmin', async () => {
    const token = await signSession({ ...payload, isAdmin: true });
    const session = await verifySession(token);

    expect(session?.isAdmin).toBe(true);
  });

  it('rechaza un token con la firma alterada', async () => {
    const token = await signSession(payload);
    const [header, body, signature] = token.split('.');
    const tampered = [header, body, signature.split('').reverse().join('')].join('.');

    expect(await verifySession(tampered)).toBeNull();
  });

  it('rechaza un token que no es un JWT', async () => {
    expect(await verifySession('esto-no-es-un-token')).toBeNull();
  });
});