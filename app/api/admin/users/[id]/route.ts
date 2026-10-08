import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
  }

  if (userId === admin.userId) {
    return NextResponse.json({ message: 'No podés cambiarte el rol a vos mismo' }, { status: 400 });
  }

  try {
    const { isAdmin } = await req.json();
    if (typeof isAdmin !== 'boolean') {
      return NextResponse.json({ message: 'El rol debe ser verdadero o falso' }, { status: 400 });
    }
    const result = await pool.query(
      'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, nombre, is_admin',
      [isAdmin, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error en PATCH /api/admin/users/[id]:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
  }

  if (userId === admin.userId) {
    return NextResponse.json({ message: 'No podés borrarte a vos mismo' }, { status: 400 });
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /api/admin/users/[id]:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}