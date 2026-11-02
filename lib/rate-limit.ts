import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

// Límite de intentos de login fallidos. Se guarda en Postgres (y no en memoria)
// porque en Vercel cada request puede caer en una instancia distinta.
export const WINDOW_MINUTES = 15;
export const MAX_FAILS_PER_ACCOUNT = 5; // protege una cuenta de fuerza bruta
export const MAX_FAILS_PER_IP = 20; // protege de alguien probando muchas cuentas

export function normalizeCorreo(correo: string) {
  return correo.trim().toLowerCase();
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return (req.headers.get('x-real-ip') ?? 'unknown').slice(0, 64);
}

export async function isLoginBlocked(correo: string, ip: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE correo = $1)::int AS por_cuenta,
       COUNT(*) FILTER (WHERE ip = $2)::int AS por_ip
     FROM login_attempts
     WHERE created_at > NOW() - make_interval(mins => $3::int)
       AND (correo = $1 OR ip = $2)`,
    [correo, ip, WINDOW_MINUTES]
  );
  return rows[0].por_cuenta >= MAX_FAILS_PER_ACCOUNT || rows[0].por_ip >= MAX_FAILS_PER_IP;
}

export async function recordFailedLogin(correo: string, ip: string) {
  await pool.query('INSERT INTO login_attempts (correo, ip) VALUES ($1, $2)', [correo, ip]);
  // Limpieza oportunista: no dejamos crecer la tabla indefinidamente
  await pool.query("DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '1 day'");
}

export async function clearFailedLogins(correo: string) {
  await pool.query('DELETE FROM login_attempts WHERE correo = $1', [correo]);
}