import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = String(body.nombre ?? '').trim();
    const apellido = String(body.apellido ?? '').trim();
    const correo = String(body.correo ?? '').trim();
    const password = String(body.password ?? '');

    if (!nombre || !apellido || !correo || !password) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (nombre.length > 100 || apellido.length > 100) {
      return NextResponse.json({ message: 'El nombre y apellido no pueden superar 100 caracteres.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return NextResponse.json({ message: 'El correo no es válido' }, { status: 400 });
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return NextResponse.json(
        { message: 'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.' },
        { status: 400 }
      );
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

    return NextResponse.json({
      user: result.rows[0],
      message: 'Usuario registrado correctamente',
    }, { status: 201 });
  } catch (err) {
    console.error('Error en /api/register:', err);
    return NextResponse.json(
      {
        message: err instanceof Error
          ? err.message
          : 'Error interno del servidor. Revisá la terminal para más detalles.',
      },
      { status: 500 }
    );
  }
}