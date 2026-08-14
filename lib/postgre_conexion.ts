import { Pool, type QueryResultRow } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Falta la variable de entorno DATABASE_URL en tu proyecto.');
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('Conexión PostgreSQL establecida.');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  const client = await pool.connect();

  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export async function testDatabaseConnection() {
  const result = await query('SELECT NOW() AS current_time');
  return result.rows[0];
}

export default pool;
