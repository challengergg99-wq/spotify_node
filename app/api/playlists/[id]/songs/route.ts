import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/get-session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const playlistId = Number(id);
    const { songId } = await req.json();
    const parsedSongId = Number(songId);
    if (!Number.isInteger(playlistId) || playlistId < 1 || !Number.isInteger(parsedSongId) || parsedSongId < 1) {
      return NextResponse.json({ message: 'La playlist y la canción deben ser válidas' }, { status: 400 });
    }

    const playlist = await pool.query('SELECT id FROM playlists WHERE id = $1 AND user_id = $2', [
      playlistId,
      session.userId,
    ]);
    if (playlist.rows.length === 0) {
      return NextResponse.json({ message: 'Playlist no encontrada' }, { status: 404 });
    }

    await pool.query(
      `INSERT INTO playlist_songs (playlist_id, song_id, position)
       VALUES (
         $1,
         $2,
         (SELECT COALESCE(MAX(position), -1) + 1 FROM playlist_songs WHERE playlist_id = $1)
       )
       ON CONFLICT (playlist_id, song_id) DO NOTHING`,
      [playlistId, parsedSongId]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Error en POST /api/playlists/[id]/songs:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const playlistId = Number(id);
    const { songId } = await req.json();
    const parsedSongId = Number(songId);
    if (!Number.isInteger(playlistId) || playlistId < 1 || !Number.isInteger(parsedSongId) || parsedSongId < 1) {
      return NextResponse.json({ message: 'La playlist y la canción deben ser válidas' }, { status: 400 });
    }

    const result = await pool.query(
      `DELETE FROM playlist_songs ps
       USING playlists p
       WHERE ps.playlist_id = p.id
         AND p.id = $1
         AND p.user_id = $2
         AND ps.song_id = $3
       RETURNING ps.song_id`,
      [playlistId, session.userId, parsedSongId]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Canción o playlist no encontrada' }, { status: 404 });
    }

    await pool.query(
      `WITH ordered AS (
         SELECT song_id, ROW_NUMBER() OVER (ORDER BY position, added_at) - 1 AS new_position
         FROM playlist_songs
         WHERE playlist_id = $1
       )
       UPDATE playlist_songs ps
       SET position = ordered.new_position
       FROM ordered
       WHERE ps.playlist_id = $1 AND ps.song_id = ordered.song_id`,
      [playlistId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /api/playlists/[id]/songs:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const { id } = await params;
    const playlistId = Number(id);
    const { orderedSongIds } = await req.json();
    if (!Number.isInteger(playlistId) || playlistId < 1 || !Array.isArray(orderedSongIds)) {
      return NextResponse.json({ message: 'El orden enviado no es válido' }, { status: 400 });
    }
    if (!orderedSongIds.every((songId) => Number.isInteger(songId) && songId > 0)) {
      return NextResponse.json({ message: 'Los IDs de las canciones no son válidos' }, { status: 400 });
    }

    await client.query('BEGIN');
    const playlist = await client.query(
      'SELECT id FROM playlists WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [playlistId, session.userId]
    );
    if (playlist.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Playlist no encontrada' }, { status: 404 });
    }

    const currentSongs = await client.query(
      'SELECT song_id FROM playlist_songs WHERE playlist_id = $1',
      [playlistId]
    );
    const currentIds = currentSongs.rows.map((row: { song_id: number }) => row.song_id);
    const requestedIds = orderedSongIds as number[];
    const requestedSet = new Set(requestedIds);
    if (
      requestedIds.length !== currentIds.length ||
      requestedSet.size !== requestedIds.length ||
      currentIds.some((songId: number) => !requestedSet.has(songId))
    ) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'El orden debe incluir cada canción de la playlist una sola vez' }, { status: 400 });
    }

    await client.query(
      `UPDATE playlist_songs AS ps
       SET position = ordered.position::integer
       FROM unnest($2::integer[]) WITH ORDINALITY AS ordered(song_id, position)
       WHERE ps.playlist_id = $1 AND ps.song_id = ordered.song_id`,
      [playlistId, requestedIds]
    );
    await client.query('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en PATCH /api/playlists/[id]/songs:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  } finally {
    client.release();
  }
}