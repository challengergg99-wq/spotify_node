import { Pool } from 'pg';

// Reutilizá esta misma instancia en todas tus rutas /api — no crees un Pool nuevo
// en cada archivo, o vas a agotar las conexiones disponibles de Postgres.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool;
}