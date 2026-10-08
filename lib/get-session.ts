import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from './auth';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}