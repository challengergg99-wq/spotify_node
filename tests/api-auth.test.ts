import { describe, it, expect, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as register } from '@/app/api/register/route';
import { POST as login } from '@/app/api/login/route';
import { pool } from '@/lib/db';

// Correo único por ejecución para no chocar con datos existentes
const correo = `ci-${Date.now()}@example.com`;
const correoBloqueo = `bloqueo-${Date.now()}@example.com`;
const ipBloqueo = '203.0.113.7'; // IP de documentación (RFC 5737), no es real
const password = 'Segura123!';

function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE correo = $1', [correo]);
  // Limpia los intentos que generaron los tests (incluida la IP "unknown" de las requests sin header)
  await pool.query('DELETE FROM login_attempts WHERE correo = ANY($1) OR ip = ANY($2)', [
    [correo, correoBloqueo, 'no-existe@example.com'],
    [ipBloqueo, 'unknown'],
  ]);
  await pool.end();
});

describe('POST /api/register', () => {
  it('rechaza el registro si faltan campos', async () => {
    const res = await register(jsonRequest('/api/register', { correo }));
    expect(res.status).toBe(400);
  });

  it('crea un usuario nuevo', async () => {
    const res = await register(
      jsonRequest('/api/register', { nombre: 'CI', apellido: 'Test', correo, password })
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.user.correo).toBe(correo);
    expect(data.user.password_hash).toBeUndefined(); // nunca se devuelve el hash
  });

  it('rechaza un correo ya registrado', async () => {
    const res = await register(
      jsonRequest('/api/register', { nombre: 'CI', apellido: 'Test', correo, password })
    );
    expect(res.status).toBe(409);
  });
});

describe('POST /api/login', () => {
  it('rechaza una contraseña incorrecta', async () => {
    const res = await login(jsonRequest('/api/login', { correo, password: 'incorrecta' }));
    expect(res.status).toBe(401);
  });

  it('rechaza un correo que no existe', async () => {
    const res = await login(
      jsonRequest('/api/login', { correo: 'no-existe@example.com', password })
    );
    expect(res.status).toBe(401);
  });

  it('inicia sesión con credenciales correctas y setea la cookie httpOnly', async () => {
    const res = await login(jsonRequest('/api/login', { correo, password }));
    const cookie = res.headers.get('set-cookie') ?? '';

    expect(res.status).toBe(200);
    expect(cookie).toContain('session_token=');
    expect(cookie).toContain('HttpOnly');
  });
});

describe('límite de intentos de login', () => {
  const headers = { 'x-forwarded-for': ipBloqueo };

  it('bloquea con 429 después de 5 intentos fallidos', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await login(
        jsonRequest('/api/login', { correo: correoBloqueo, password: 'mala' }, headers)
      );
      expect(res.status).toBe(401);
    }

    const bloqueado = await login(
      jsonRequest('/api/login', { correo: correoBloqueo, password: 'mala' }, headers)
    );
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.headers.get('retry-after')).toBe('900');
  });

  it('no afecta a otras cuentas desde otra IP', async () => {
    const res = await login(
      jsonRequest('/api/login', { correo, password }, { 'x-forwarded-for': '198.51.100.9' })
    );
    expect(res.status).toBe(200);
  });
});