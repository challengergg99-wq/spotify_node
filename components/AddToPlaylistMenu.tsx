'use client';

import { useEffect, useRef, useState } from 'react';

type Playlist = { id: number; name: string };

export default function AddToPlaylistMenu({ songId }: { songId: number }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // que no dispare el click de "reproducir" de la fila
    setOpen((prev) => !prev);
    setFeedback(null);

    if (!open && playlists.length === 0) {
      setLoading(true);
      fetch('/api/playlists')
        .then((res) => res.json())
        .then((data) => setPlaylists(data.playlists ?? []))
        .finally(() => setLoading(false));
    }
  };

  const handleAdd = async (playlistId: number, playlistName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });

    if (res.ok) {
      setFeedback(`Agregada a "${playlistName}"`);
      setTimeout(() => setOpen(false), 900);
    } else {
      setFeedback('No se pudo agregar');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleOpen}
        aria-label="Agregar a playlist"
        className="w-7 h-7 flex items-center justify-center rounded-full text-[#9A9691] hover:text-[#F5F3EE] hover:bg-white/[0.08] transition-colors text-base leading-none"
      >
        +
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-30 w-56 bg-[#17171A] border border-white/10 rounded-md shadow-xl py-1"
        >
          {feedback && <p className="px-3 py-2 text-xs text-[#E8B34C]">{feedback}</p>}

          {!feedback && loading && (
            <p className="px-3 py-2 text-xs text-[#6E6B67]">Cargando playlists...</p>
          )}

          {!feedback && !loading && playlists.length === 0 && (
            <p className="px-3 py-2 text-xs text-[#6E6B67]">
              No tenés playlists. Creá una primero desde el Sidebar.
            </p>
          )}

          {!feedback &&
            !loading &&
            playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={(e) => handleAdd(pl.id, pl.name, e)}
                className="w-full text-left px-3 py-2 text-sm text-[#DCD9D3] hover:bg-white/[0.06] hover:text-[#F5F3EE] transition-colors truncate"
              >
                {pl.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}