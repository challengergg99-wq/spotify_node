import { describe, it, expect, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as register } from '@/app/api/register/route';
import { POST as login } from '@/app/api/login/route';
import { pool } from '@/lib/db';

// Correo único por ejecución para no chocar con datos existentes
const correo = `ci-${Date.now()}@example.com`;
const password = 'Segura123!';

function jsonRequest(url: string, body: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE correo = $1', [correo]);
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