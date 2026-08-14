import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, validateEmail, validatePasswordStrength } from '@/lib/auth';
import { registerUser, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, apellido, correo, password } = body;

    // ===== Validaciones =====
    
    // 1. Verificar que todos los campos existan
    if (!nombre || !apellido || !correo || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // 2. Validar email
    if (!validateEmail(correo)) {
      return NextResponse.json(
        { message: 'El formato de correo no es válido' },
        { status: 400 }
      );
    }

    // 3. Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: 'Contraseña débil', errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // 4. Verificar que el email no esté registrado
    const existingUser = await getUserByEmail(correo);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Este correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    // ===== Procesar Registro =====

    // 1. Encriptar contraseña
    const passwordHash = await hashPassword(password);

    // 2. Registrar en base de datos
    const newUser = await registerUser(nombre, apellido, correo, passwordHash);

    // 3. Retornar respuesta exitosa
    return NextResponse.json(
      {
        message: 'Registro exitoso. ¡Bienvenido!',
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          correo: newUser.correo,
          created_at: newUser.created_at
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en registro:', error);

    // Manejo de errores específicos
    if (error.message === 'El correo electrónico ya está registrado') {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Error al procesar el registro. Intenta nuevamente más tarde.' },
      { status: 500 }
    );
  }
}
