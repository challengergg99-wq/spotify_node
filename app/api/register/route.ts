import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { nombre, apellido, correo, password } = await req.json();

    if (!nombre || !apellido || !correo || !password) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const existing = await pool.query('SELECT id FROM users WHERE correo = $1', [correo]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ message: 'Ese correo ya está registrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (nombre, apellido, correo, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, correo`,
      [nombre, apellido, correo, passwordHash]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Error en /api/register:', err);
    return NextResponse.json(
      { message: 'Error interno del servidor. Revisá la terminal para más detalles.' },
      { status: 500 }
    );
  }
}