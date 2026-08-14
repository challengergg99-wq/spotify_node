import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, validateEmail } from '@/lib/auth';
import { getUserByEmail, getUserPasswordHash } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, password } = body;

    // Validaciones básicas
    if (!correo || !password) {
      return NextResponse.json(
        { message: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (!validateEmail(correo)) {
      return NextResponse.json(
        { message: 'El formato de correo no es válido' },
        { status: 400 }
      );
    }

    // Buscar usuario por correo
    const user = await getUserByEmail(correo);
    if (!user) {
      return NextResponse.json(
        { message: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Obtener hash de contraseña
    const passwordHash = await getUserPasswordHash(correo);
    if (!passwordHash) {
      return NextResponse.json(
        { message: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Login exitoso
    return NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { message: 'Error al procesar el login. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
