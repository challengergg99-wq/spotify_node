import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/get-session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, COUNT(ps.song_id)::int AS song_count
       FROM playlists p
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [session.userId]
    );
    return NextResponse.json({ playlists: result.rows });
  } catch (err) {
    console.error('Error en GET /api/playlists:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'El nombre es requerido' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO playlists (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description`,
      [session.userId, name.trim(), description ?? null]
    );

    return NextResponse.json({ playlist: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Error en POST /api/playlists:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}