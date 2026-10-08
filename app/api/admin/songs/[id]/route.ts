import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { title, artist, album, duration, src, cover } = await req.json();

    const result = await pool.query(
      `UPDATE songs
       SET title = $1, artist = $2, album = $3, duration = $4, src = $5, cover = $6
       WHERE id = $7
       RETURNING id, title, artist, album, duration, src, cover`,
      [title, artist, album ?? null, duration, src, cover ?? null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Canción no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ song: result.rows[0] });
  } catch (err) {
    console.error('Error en PUT /api/admin/songs/[id]:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await pool.query('DELETE FROM songs WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /api/admin/songs/[id]:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}