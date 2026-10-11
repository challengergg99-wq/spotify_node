import { expect, test } from 'vitest';
import { parseSongInput } from '../lib/song-validation';

const validSong = {
  title: '  Mi canción  ',
  artist: '  Artista  ',
  album: '  Álbum  ',
  duration: '180',
  src: '  /music/cancion.mp3  ',
};

test('parseSongInput trims text, parses duration, and defaults the cover to null', () => {
  expect(parseSongInput(validSong)).toEqual({
    song: {
      title: 'Mi canción',
      artist: 'Artista',
      album: 'Álbum',
      duration: 180,
      src: '/music/cancion.mp3',
      cover: null,
    },
  });
});

test('parseSongInput accepts a cover path and converts a blank cover to null', () => {
  expect(parseSongInput({ ...validSong, cover: '/covers/album.jpg' }).song?.cover).toBe('/covers/album.jpg');
  expect(parseSongInput({ ...validSong, cover: '   ' }).song?.cover).toBeNull();
});

test('parseSongInput rejects values that are not objects', () => {
  for (const value of [null, undefined, [], 'canción', 42]) {
    expect(parseSongInput(value).error).toBe('Los datos de la canción no son válidos');
  }
});

test('parseSongInput requires title, artist, album, and audio path', () => {
  for (const field of ['title', 'artist', 'album', 'src'] as const) {
    expect(parseSongInput({ ...validSong, [field]: '   ' }).error).toBe(
      'Título, artista, álbum y ruta de audio son obligatorios'
    );
  }
});

test('parseSongInput rejects title, artist, and album longer than 255 characters', () => {
  for (const field of ['title', 'artist', 'album'] as const) {
    expect(parseSongInput({ ...validSong, [field]: 'a'.repeat(256) }).error).toBe(
      'Título, artista y álbum deben tener hasta 255 caracteres'
    );
  }
});

test('parseSongInput accepts duration bounds and rejects invalid durations', () => {
  expect(parseSongInput({ ...validSong, duration: 0 }).song?.duration).toBe(0);
  expect(parseSongInput({ ...validSong, duration: 86400 }).song?.duration).toBe(86400);

  for (const duration of [-1, 86401, 1.5, Number.NaN, 'no es número', null, true, '   ']) {
    expect(parseSongInput({ ...validSong, duration }).error).toBe(
      'La duración debe ser un número entero entre 0 y 86400 segundos'
    );
  }
});

test('parseSongInput only accepts safe audio paths under /music/', () => {
  for (const src of ['/audio/cancion.mp3', '/music/../privado.mp3', '/music\\cancion.mp3']) {
    expect(parseSongInput({ ...validSong, src }).error).toBe(
      'La ruta de audio debe apuntar a un archivo dentro de /music/'
    );
  }
});

test('parseSongInput only accepts safe cover paths under /covers/', () => {
  for (const cover of ['/images/portada.jpg', '/covers/../privado.jpg', '/covers\\portada.jpg']) {
    expect(parseSongInput({ ...validSong, cover }).error).toBe(
      'La portada debe apuntar a un archivo dentro de /covers/'
    );
  }
});
