import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { signSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { correo, password } = await req.json();

    if (!correo || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son requeridos' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT id, nombre, correo, password_hash FROM users WHERE correo = $1',
      [correo]
    );
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ message: 'Correo o contraseña incorrectos' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return NextResponse.json({ message: 'Correo o contraseña incorrectos' }, { status: 401 });
    }

    const token = await signSession({
      userId: user.id,
      nombre: user.nombre,
      correo: user.correo,
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
    // Este console.error es el que hay que mirar en la terminal de `npm run dev`
    console.error('Error en /api/login:', err);
    return NextResponse.json(
      { message: 'Error interno del servidor. Revisá la terminal para más detalles.' },
      { status: 500 }
    );
  }
}