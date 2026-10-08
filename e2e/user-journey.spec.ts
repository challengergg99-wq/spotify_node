import { expect, test } from '@playwright/test';
import { e2eEnv } from './env';

const baseURL = 'http://127.0.0.1:3100';

let createdPlaylistId: string | undefined;

test.afterEach(async ({ page }) => {
  if (!createdPlaylistId) return;

  const playlistId = createdPlaylistId;
  createdPlaylistId = undefined;
  const response = await page.request.delete(
    `${baseURL}/api/playlists/${playlistId}`
  );
  expect(response.ok()).toBe(true);
});

test('muestra un error al iniciar sesión con una contraseña incorrecta', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('correo@ejemplo.com').fill(e2eEnv.userEmail);
  await page.getByPlaceholder('••••••••').fill(`${e2eEnv.userPassword}-incorrecta`);
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await expect(page.getByText('Correo o contraseña incorrectos')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('inicia sesión, busca una canción y la agrega a una playlist', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('correo@ejemplo.com').fill(e2eEnv.userEmail);
  await page.getByPlaceholder('••••••••').fill(e2eEnv.userPassword);
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await expect(page).toHaveURL(`${baseURL}/`);
  await page.goto('/search');

  const playlistName = `E2E playlist ${Date.now()}`;
  page.once('dialog', (dialog) => dialog.accept(playlistName));
  await page.getByRole('button', { name: 'Crear playlist' }).click();
  await expect(page).toHaveURL(/\/playlist\/\d+$/);
  createdPlaylistId = page.url().match(/\/playlist\/(\d+)$/)?.[1];
  expect(createdPlaylistId).toBeTruthy();

  await page.goto('/search');
  await page
    .getByRole('searchbox', { name: 'Buscar canciones y playlists' })
    .fill(e2eEnv.searchQuery);

  const addButton = page.getByRole('button', { name: 'Agregar a playlist' }).first();
  await expect(addButton).toBeVisible();
  const songRow = addButton.locator('xpath=../..');
  const songTitle = (await songRow.locator('p').first().innerText()).trim();
  expect(songTitle).not.toBe('');

  await addButton.click();
  await page.getByRole('button', { name: playlistName, exact: true }).click();
  await expect(page.getByText(`Agregada a "${playlistName}"`)).toBeVisible();

  await page.getByRole('link', { name: playlistName }).first().click();
  await expect(page.getByRole('heading', { name: playlistName })).toBeVisible();
  await expect(page.getByText(songTitle, { exact: true })).toBeVisible();
});
