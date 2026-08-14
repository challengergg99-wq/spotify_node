import { query } from './postgre_conexion';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Registrar un nuevo usuario en la base de datos
 */
export async function registerUser(
  nombre: string,
  apellido: string,
  correo: string,
  passwordHash: string
): Promise<User> {
  const text = `
    INSERT INTO users (nombre, apellido, correo, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, apellido, correo, created_at, updated_at
  `;

  try {
    const result = await query<User>(text, [
      nombre,
      apellido,
      correo,
      passwordHash
    ]);

    if (result.rows.length === 0) {
      throw new Error('Error al crear el usuario');
    }

    return result.rows[0];
  } catch (error: any) {
    // Verificar si el error es por email duplicado
    if (error.code === '23505') {
      throw new Error('El correo electrónico ya está registrado');
    }
    throw error;
  }
}

/**
 * Obtener usuario por correo
 */
export async function getUserByEmail(correo: string): Promise<User | null> {
  const text = `
    SELECT id, nombre, apellido, correo, created_at, updated_at
    FROM users
    WHERE correo = $1
  `;

  try {
    const result = await query<User>(text, [correo]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const text = `
    SELECT id, nombre, apellido, correo, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  try {
    const result = await query<User>(text, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

/**
 * Obtener hash de contraseña de usuario por correo (para login)
 */
export async function getUserPasswordHash(
  correo: string
): Promise<string | null> {
  const text = `
    SELECT password_hash
    FROM users
    WHERE correo = $1
  `;

  try {
    const result = await query<{ password_hash: string }>(text, [correo]);
    return result.rows.length > 0 ? result.rows[0].password_hash : null;
  } catch (error) {
    console.error('Error al obtener hash de contraseña:', error);
    throw error;
  }
}

/**
 * Actualizar usuario
 */
export async function updateUser(
  id: number,
  nombre?: string,
  apellido?: string
): Promise<User | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (nombre !== undefined) {
    updates.push(`nombre = $${paramCount++}`);
    values.push(nombre);
  }

  if (apellido !== undefined) {
    updates.push(`apellido = $${paramCount++}`);
    values.push(apellido);
  }

  if (updates.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const text = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, nombre, apellido, correo, created_at, updated_at
  `;

  try {
    const result = await query<User>(text, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}

/**
 * Eliminar usuario
 */
export async function deleteUser(id: number): Promise<boolean> {
  const text = 'DELETE FROM users WHERE id = $1';

  try {
    const result = await query(text, [id]);
    return result.rowCount! > 0;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
}
