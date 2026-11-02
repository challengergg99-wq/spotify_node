import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { signSession, SESSION_COOKIE } from '@/lib/auth';
import {
  WINDOW_MINUTES,
  clearFailedLogins,
  getClientIp,
  isLoginBlocked,
  normalizeCorreo,
  recordFailedLogin,
} from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { correo, password } = await req.json();

    if (typeof correo !== 'string' || typeof password !== 'string' || !correo || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son requeridos' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const key = normalizeCorreo(correo);

    // Antes de tocar la contraseña: si ya hay demasiados fallos, cortamos acá
    if (await isLoginBlocked(key, ip)) {
      return NextResponse.json(
        { message: `Demasiados intentos fallidos. Probá de nuevo en ${WINDOW_MINUTES} minutos.` },
        { status: 429, headers: { 'Retry-After': String(WINDOW_MINUTES * 60) } }
      );
    }

    const result = await pool.query(
      'SELECT id, nombre, correo, password_hash, is_admin FROM users WHERE correo = $1',
      [correo]
    );
    const user = result.rows[0];

    if (!user) {
      await recordFailedLogin(key, ip);
      return NextResponse.json({ message: 'Correo o contraseña incorrectos' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      await recordFailedLogin(key, ip);
      return NextResponse.json({ message: 'Correo o contraseña incorrectos' }, { status: 401 });
    }

    // Login correcto: se reinicia el contador de esa cuenta
    await clearFailedLogins(key);

    const token = await signSession({
      userId: user.id,
      nombre: user.nombre,
      correo: user.correo,
      isAdmin: user.is_admin,
    });

    const response = NextResponse.json({
      user: { nombre: user.nombre, correo: user.correo },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('Error en /api/login:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}