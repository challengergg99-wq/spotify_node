function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} para ejecutar las pruebas E2E.`);
  }
  return value;
}

const searchQuery = requiredEnv('E2E_SEARCH_QUERY');
if (searchQuery.length < 2) {
  throw new Error('E2E_SEARCH_QUERY debe tener al menos 2 caracteres.');
}

export const e2eEnv = {
  databaseUrl: requiredEnv('DATABASE_URL'),
  userEmail: requiredEnv('E2E_USER_EMAIL'),
  userPassword: requiredEnv('E2E_USER_PASSWORD'),
  searchQuery
};
