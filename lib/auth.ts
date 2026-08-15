import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Falta la variable de entorno JWT_SECRET (agregala a tu .env.local)');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export const SESSION_COOKIE = 'session_token';

export type SessionPayload = {
  userId: number;
  nombre: string;
  correo: string;
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}