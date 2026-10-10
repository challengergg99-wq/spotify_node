'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SongRow from '@/components/SongRow';
import type { Song } from '@/lib/player-context';

type Playlist = { id: number; name: string; description: string | null };

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError('');
      setSongs([]);
      setPlaylists([]);

      if (q.length < 2) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? 'No se pudo completar la búsqueda.');
        }

        setSongs(data.songs ?? []);
        setPlaylists(data.playlists ?? []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Error de conexión.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const normalizedQuery = query.trim();
  const hasQuery = query.trim() !== '';
  const visibleSongs = hasQuery ? songs : [];
  const visiblePlaylists = hasQuery ? playlists : [];
  const hasResults = visibleSongs.length > 0 || visiblePlaylists.length > 0;

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 bg-gradient-to-b from-[#17171A] to-[#0B0B0D]">
      <div className="max-w-xl mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué querés escuchar?"
          aria-label="Buscar canciones y playlists"
          autoFocus
          className="w-full bg-white/[0.06] focus:bg-white/[0.09] border border-transparent focus:border-[#E8B34C]/40 rounded-full px-5 py-3 text-sm text-[#F5F3EE] placeholder:text-[#6E6B67] outline-none transition-colors"
        />
      </div>

      {!hasQuery && (
        <p className="text-sm text-[#6E6B67]">Empezá a escribir para buscar canciones y playlists.</p>
      )}

      {normalizedQuery.length === 1 && (
        <p className="text-sm text-[#6E6B67]">Escribí al menos 2 caracteres para buscar.</p>
      )}

      {normalizedQuery.length >= 2 && loading && (
        <p className="text-sm text-[#6E6B67]" role="status" aria-live="polite">Buscando...</p>
      )}

      {normalizedQuery.length >= 2 && !loading && error && (
        <p className="text-sm text-red-300" role="alert">{error}</p>
      )}

      {normalizedQuery.length >= 2 && !loading && !error && !hasResults && (
        <p className="text-sm text-[#6E6B67]">
          No encontramos nada para “{normalizedQuery}”. Probá con otro término.
        </p>
      )}

      {visiblePlaylists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#F5F3EE] mb-3 font-[family-name:var(--font-display)]">
            Playlists
          </h2>
          <div className="flex flex-col gap-1">
            {visiblePlaylists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className="px-3 py-2.5 rounded-md hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-sm font-medium text-[#F5F3EE]">{pl.name}</p>
                {pl.description && <p className="text-xs text-[#9A9691]">{pl.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {visibleSongs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[#F5F3EE] mb-3 font-[family-name:var(--font-display)]">
            Canciones
          </h2>
          <div className="flex flex-col gap-0.5">
            {visibleSongs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={visibleSongs} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}