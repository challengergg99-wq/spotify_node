import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSongInput } from '../lib/song-validation';

const validSong = {
  title: '  Mi canción  ',
  artist: '  Artista  ',
  album: '  Álbum  ',
  duration: '180',
  src: '  /music/cancion.mp3  ',
};

test('parseSongInput trims text, parses duration, and defaults the cover to null', () => {
  assert.deepEqual(parseSongInput(validSong), {
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
  assert.equal(
    parseSongInput({ ...validSong, cover: '/covers/album.jpg' }).song?.cover,
    '/covers/album.jpg'
  );
  assert.equal(parseSongInput({ ...validSong, cover: '   ' }).song?.cover, null);
});

test('parseSongInput rejects values that are not objects', () => {
  for (const value of [null, undefined, [], 'canción', 42]) {
    assert.equal(parseSongInput(value).error, 'Los datos de la canción no son válidos');
  }
});

test('parseSongInput requires title, artist, album, and audio path', () => {
  for (const field of ['title', 'artist', 'album', 'src'] as const) {
    assert.equal(
      parseSongInput({ ...validSong, [field]: '   ' }).error,
      'Título, artista, álbum y ruta de audio son obligatorios'
    );
  }
});

test('parseSongInput rejects title, artist, and album longer than 255 characters', () => {
  for (const field of ['title', 'artist', 'album'] as const) {
    assert.equal(
      parseSongInput({ ...validSong, [field]: 'a'.repeat(256) }).error,
      'Título, artista y álbum deben tener hasta 255 caracteres'
    );
  }
});

test('parseSongInput accepts duration bounds and rejects invalid durations', () => {
  assert.equal(parseSongInput({ ...validSong, duration: 0 }).song?.duration, 0);
  assert.equal(parseSongInput({ ...validSong, duration: 86400 }).song?.duration, 86400);

  for (const duration of [-1, 86401, 1.5, Number.NaN, 'no es número', null, true, '   ']) {
    assert.equal(
      parseSongInput({ ...validSong, duration }).error,
      'La duración debe ser un número entero entre 0 y 86400 segundos'
    );
  }
});

test('parseSongInput only accepts safe audio paths under /music/', () => {
  for (const src of ['/audio/cancion.mp3', '/music/../privado.mp3', '/music\\cancion.mp3']) {
    assert.equal(
      parseSongInput({ ...validSong, src }).error,
      'La ruta de audio debe apuntar a un archivo dentro de /music/'
    );
  }
});

test('parseSongInput only accepts safe cover paths under /covers/', () => {
  for (const cover of ['/images/portada.jpg', '/covers/../privado.jpg', '/covers\\portada.jpg']) {
    assert.equal(
      parseSongInput({ ...validSong, cover }).error,
      'La portada debe apuntar a un archivo dentro de /covers/'
    );
  }
});
