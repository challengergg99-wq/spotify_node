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
      `SELECT p.id, p.name, u.nombre AS owner_nombre, u.correo AS owner_correo,
              COUNT(ps.song_id)::int AS song_count
       FROM playlists p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       GROUP BY p.id, u.nombre, u.correo
       ORDER BY p.created_at DESC`
    );
    return NextResponse.json({ playlists: result.rows });
  } catch (err) {
    console.error('Error en GET /api/admin/playlists:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}