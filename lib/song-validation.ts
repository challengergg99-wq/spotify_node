export type SongInput = {
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  cover: string | null;
};

export function parseSongInput(value: unknown): { song?: SongInput; error?: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { error: 'Los datos de la canción no son válidos' };
  }

  const body = value as Record<string, unknown>;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const artist = typeof body.artist === 'string' ? body.artist.trim() : '';
  const album = typeof body.album === 'string' ? body.album.trim() : '';
  const src = typeof body.src === 'string' ? body.src.trim() : '';
  const cover = typeof body.cover === 'string' ? body.cover.trim() : '';
  const duration = Number(body.duration);

  if (!title || !artist || !album || !src) {
    return { error: 'Título, artista, álbum y ruta de audio son obligatorios' };
  }
  if (title.length > 255 || artist.length > 255 || album.length > 255) {
    return { error: 'Título, artista y álbum deben tener hasta 255 caracteres' };
  }
  if (!Number.isInteger(duration) || duration < 0 || duration > 86400) {
    return { error: 'La duración debe ser un número entero entre 0 y 86400 segundos' };
  }
  if (!src.startsWith('/music/') || src.includes('..') || src.includes('\\')) {
    return { error: 'La ruta de audio debe apuntar a un archivo dentro de /music/' };
  }
  if (cover && (!cover.startsWith('/covers/') || cover.includes('..') || cover.includes('\\'))) {
    return { error: 'La portada debe apuntar a un archivo dentro de /covers/' };
  }

  return { song: { title, artist, album, duration, src, cover: cover || null } };
}