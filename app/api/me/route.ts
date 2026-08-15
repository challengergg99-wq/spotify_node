import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: { nombre: session.nombre, correo: session.correo },
  });
}