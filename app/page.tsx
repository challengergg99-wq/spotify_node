'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SONGS, PLAYLISTS } from '@/lib/mock-data';
import SongRow from '@/components/SongRow';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredPlaylists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PLAYLISTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const hasResults = filteredSongs.length > 0 || filteredPlaylists.length > 0;

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 bg-gradient-to-b from-[#17171A] to-[#0B0B0D]">
      <div className="max-w-xl mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué querés escuchar?"
          autoFocus
          className="w-full bg-white/[0.06] focus:bg-white/[0.09] border border-transparent focus:border-[#E8B34C]/40 rounded-full px-5 py-3 text-sm text-[#F5F3EE] placeholder:text-[#6E6B67] outline-none transition-colors"
        />
      </div>

      {!query && (
        <p className="text-sm text-[#6E6B67]">Empezá a escribir para buscar canciones y playlists.</p>
      )}

      {query && !hasResults && (
        <p className="text-sm text-[#6E6B67]">
          No encontramos nada para “{query}”. Probá con otro término.
        </p>
      )}

      {filteredPlaylists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#F5F3EE] mb-3 font-[family-name:var(--font-display)]">
            Playlists
          </h2>
          <div className="flex flex-col gap-1">
            {filteredPlaylists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className="px-3 py-2.5 rounded-md hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-sm font-medium text-[#F5F3EE]">{pl.name}</p>
                <p className="text-xs text-[#9A9691]">{pl.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {filteredSongs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[#F5F3EE] mb-3 font-[family-name:var(--font-display)]">
            Canciones
          </h2>
          <div className="flex flex-col gap-0.5">
            {filteredSongs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={filteredSongs} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}