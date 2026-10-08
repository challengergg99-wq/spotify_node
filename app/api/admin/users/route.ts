import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.correo, u.is_admin, u.created_at,
              COUNT(p.id)::int AS playlist_count
       FROM users u
       LEFT JOIN playlists p ON p.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return NextResponse.json({ users: result.rows });
  } catch (err) {
    console.error('Error en GET /api/admin/users:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}