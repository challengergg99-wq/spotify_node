import { getSession } from './get-session';
import { pool } from './db';

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;

  const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [session.userId]);
  if (!result.rows[0]?.is_admin) return null;

  return session;
}