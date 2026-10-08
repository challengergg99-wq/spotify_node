import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const playlistId = Number(id);
    if (!Number.isSafeInteger(playlistId) || playlistId < 1) {
      return NextResponse.json({ message: 'Playlist no encontrada' }, { status: 404 });
    }

    const result = await pool.query('DELETE FROM playlists WHERE id = $1 RETURNING id', [playlistId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Playlist no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /api/admin/playlists/[id]:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}