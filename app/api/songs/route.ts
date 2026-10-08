import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, title, artist, album, duration, src, cover FROM songs ORDER BY created_at DESC'
    );
    return NextResponse.json({ songs: result.rows });
  } catch (err) {
    console.error('Error en GET /api/songs:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}