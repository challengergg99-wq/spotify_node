import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/get-session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ songs: [], playlists: [] });
  }
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json(
      { message: 'La búsqueda debe tener entre 2 y 100 caracteres.' },
      { status: 400 }
    );
  }

  try {
    const prefix = `${q}%`;
    const contains = `%${q}%`;

    const songs = await pool.query(
      `SELECT id, title, artist, album, duration, src, cover
       FROM songs
       WHERE title ILIKE $3 OR artist ILIKE $3 OR album ILIKE $3
       ORDER BY CASE
         WHEN title ILIKE $1 THEN 0
         WHEN title ILIKE $2 THEN 1
         WHEN artist ILIKE $1 THEN 2
         WHEN artist ILIKE $2 THEN 3
         WHEN album ILIKE $1 THEN 4
         WHEN album ILIKE $2 THEN 5
         ELSE 6
       END, title ASC
       LIMIT 25`,
      [q, prefix, contains]
    );

    const playlists = await pool.query(
      `SELECT id, name, description
       FROM playlists
       WHERE user_id = $1 AND name ILIKE $3
       ORDER BY CASE
         WHEN name ILIKE $2 THEN 0
         WHEN name ILIKE $4 THEN 1
         ELSE 2
       END, name ASC
       LIMIT 10`,
      [session.userId, q, contains, prefix]
    );

    return NextResponse.json({ songs: songs.rows, playlists: playlists.rows });
  } catch (err) {
    console.error('Error en GET /api/search:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}