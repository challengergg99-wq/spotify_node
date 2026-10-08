import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/get-session';

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedPlaylistId(params: RouteContext['params'], userId: number) {
  const { id } = await params;
  const playlistId = Number(id);
  if (!Number.isInteger(playlistId) || playlistId < 1) return null;

  const result = await pool.query(
    'SELECT id FROM playlists WHERE id = $1 AND user_id = $2',
    [playlistId, userId]
  );
  return result.rows[0]?.id as number | undefined;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'No autenticado' }, { status: 401 });

  try {
    const playlistId = await getOwnedPlaylistId(params, session.userId);
    if (!playlistId) return NextResponse.json({ message: 'Playlist no encontrada' }, { status: 404 });

    const body = await req.json();
    const hasName = Object.prototype.hasOwnProperty.call(body, 'name');
    const hasDescription = Object.prototype.hasOwnProperty.call(body, 'description');
    if (!hasName && !hasDescription) {
      return NextResponse.json({ message: 'No hay cambios para guardar' }, { status: 400 });
    }

    const name = hasName && typeof body.name === 'string' ? body.name.trim() : null;
    const description = body.description === null
      ? null
      : typeof body.description === 'string'
        ? body.description.trim()
        : null;
    if (hasName && (!name || name.length > 255)) {
      return NextResponse.json({ message: 'El nombre debe tener entre 1 y 255 caracteres' }, { status: 400 });
    }
    if (hasDescription && body.description !== null && typeof body.description !== 'string') {
      return NextResponse.json({ message: 'La descripción no es válida' }, { status: 400 });
    }
    if (hasDescription && description && description.length > 1000) {
      return NextResponse.json({ message: 'La descripción no puede superar 1000 caracteres' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE playlists
       SET name = CASE WHEN $3 THEN $4 ELSE name END,
           description = CASE WHEN $5 THEN $6 ELSE description END
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, description`,
      [playlistId, session.userId, hasName, name, hasDescription, description]
    );
    return NextResponse.json({ playlist: result.rows[0] });
  } catch (err) {
    console.error('Error en PATCH /api/playlists/[id]:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'No autenticado' }, { status: 401 });

  try {
    const playlistId = await getOwnedPlaylistId(params, session.userId);
    if (!playlistId) return NextResponse.json({ message: 'Playlist no encontrada' }, { status: 404 });

    await pool.query('DELETE FROM playlists WHERE id = $1 AND user_id = $2', [playlistId, session.userId]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /api/playlists/[id]:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}