import { defineConfig } from 'vitest/config';
import { loadEnvConfig } from '@next/env';
import path from 'node:path';

// Carga .env.local igual que Next.js (en CI las variables ya vienen del workflow
// y no se pisan).
loadEnvConfig(process.cwd());

// Para los tests unitarios que no tocan la base de datos
process.env.JWT_SECRET ??= 'test-secret-only-for-tests';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});