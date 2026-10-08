'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Playlist = { id: number; name: string; song_count: number };

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/search', label: 'Buscar' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data.user?.isAdmin)));
  }, []);

  const loadPlaylists = () => {
    fetch('/api/playlists')
      .then((res) => res.json())
      .then((data) => setPlaylists(data.playlists ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleCreatePlaylist = async () => {
    const name = window.prompt('Nombre de la nueva playlist:');
    if (!name || !name.trim()) return;

    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const data = await res.json();
      loadPlaylists();
      router.push(`/playlist/${data.playlist.id}`);
    } else {
      alert('No se pudo crear la playlist. Intentá de nuevo.');
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 h-full bg-[#0B0B0D] border-r border-white/[0.06] px-3 py-4 gap-4">
      <div className="px-3 py-2">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[#F5F3EE]"
        >
          groove<span className="text-[#E8B34C]">.</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
              pathname === item.href
                ? 'bg-white/[0.08] text-[#F5F3EE]'
                : 'text-[#9A9691] hover:text-[#F5F3EE] hover:bg-white/[0.04]'
            }`}
          >
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="px-3 py-2.5 rounded-md text-sm font-semibold text-[#E8B34C] hover:bg-white/[0.04] transition-colors"
          >
            Admin
          </Link>
        )}
      </nav>

      <div className="h-px bg-white/[0.06] mx-3" />

      <div className="flex-1 overflow-y-auto px-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A9691]">
            Tus playlists
          </span>
          <button
            onClick={handleCreatePlaylist}
            aria-label="Crear playlist"
            className="w-6 h-6 flex items-center justify-center rounded-full text-[#9A9691] hover:text-[#F5F3EE] hover:bg-white/[0.06] transition-colors text-lg leading-none"
          >
            +
          </button>
        </div>

        {loading && <p className="text-xs text-[#6E6B67] px-2">Cargando...</p>}

        {!loading && playlists.length === 0 && (
          <p className="text-xs text-[#6E6B67] px-2">Todavía no tenés playlists. Creá una con el +.</p>
        )}

        <ul className="flex flex-col gap-0.5">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <Link
                href={`/playlist/${pl.id}`}
                className={`block px-2 py-2 rounded-md hover:bg-white/[0.04] transition-colors group ${
                  pathname === `/playlist/${pl.id}` ? 'bg-white/[0.06]' : ''
                }`}
              >
                <p className="text-sm font-medium text-[#DCD9D3] group-hover:text-[#F5F3EE] truncate">
                  {pl.name}
                </p>
                <p className="text-xs text-[#6E6B67] truncate">
                  Playlist · {pl.song_count} canciones
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}