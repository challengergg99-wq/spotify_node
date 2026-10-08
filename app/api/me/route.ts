import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const result = await pool.query(
      'SELECT nombre, correo, is_admin FROM users WHERE id = $1',
      [session.userId]
    );
    const user = result.rows[0];
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: { nombre: user.nombre, correo: user.correo, isAdmin: user.is_admin },
    });
  } catch (err) {
    console.error('Error en GET /api/me:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}