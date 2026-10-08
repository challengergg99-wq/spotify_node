'use client';

import { useEffect, useState } from 'react';

type Playlist = {
  id: number;
  name: string;
  owner_nombre: string;
  owner_correo: string;
  song_count: number;
};

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/playlists')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'No se pudieron cargar las playlists.');
        setPlaylists(data.playlists ?? []);
        setError('');
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Error de conexión.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (playlist: Playlist) => {
    if (!confirm(`¿Borrar la playlist "${playlist.name}" de ${playlist.owner_nombre}?`)) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/playlists/${playlist.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'No se pudo borrar la playlist.');
      load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Error de conexión.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-display)]">
        Playlists (todos los usuarios)
      </h1>
      {error && <p className="mb-4 text-sm text-red-300" role="alert">{error}</p>}

      {loading ? (
        <p className="text-sm text-[#6E6B67]">Cargando...</p>
      ) : playlists.length === 0 ? (
        <p className="text-sm text-[#6E6B67]">Todavía no hay playlists creadas.</p>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-4 px-3 py-2 text-xs text-[#6E6B67] border-b border-white/[0.06]">
            <span>Playlist</span>
            <span>Dueño</span>
            <span>Canciones</span>
            <span></span>
          </div>

          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="grid grid-cols-[1fr_1fr_80px_auto] items-center gap-4 px-3 py-2.5 rounded-md hover:bg-white/[0.04]"
            >
              <span className="text-sm truncate">{pl.name}</span>
              <span className="text-sm text-[#9A9691] truncate">
                {pl.owner_nombre} ({pl.owner_correo})
              </span>
              <span className="text-sm text-[#9A9691]">{pl.song_count}</span>
              <button
                onClick={() => handleDelete(pl)}
                className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors w-fit"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}