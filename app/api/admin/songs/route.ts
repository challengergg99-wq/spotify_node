import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const { title, artist, album, duration, src, cover } = await req.json();

    if (!title || !artist || !duration || !src) {
      return NextResponse.json(
        { message: 'title, artist, duration y src son requeridos' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO songs (title, artist, album, duration, src, cover)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, artist, album, duration, src, cover`,
      [title, artist, album ?? null, duration, src, cover ?? null]
    );

    return NextResponse.json({ song: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Error en POST /api/admin/songs:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}