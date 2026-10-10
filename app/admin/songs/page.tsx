'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Song = {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  src: string;
  cover: string | null;
};

const EMPTY_FORM = { title: '', artist: '', album: '', duration: '', src: '', cover: '' };

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data) => setSongs(data.songs ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (song: Song) => {
    setEditingId(song.id);
    setForm({
      title: song.title,
      artist: song.artist,
      album: song.album ?? '',
      duration: String(song.duration),
      src: song.src,
      cover: song.cover ?? '',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Borrar esta canción? Se va a quitar de todas las playlists también.')) return;
    const res = await fetch(`/api/admin/songs/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      title: form.title,
      artist: form.artist,
      album: form.album || null,
      duration: Number(form.duration),
      src: form.src,
      cover: form.cover || null,
    };

    const url = editingId ? `/api/admin/songs/${editingId}` : '/api/admin/songs';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      load();
    } else {
      const data = await res.json();
      setError(data.message || 'Error al guardar');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-display)]">Canciones</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 p-4 bg-white/[0.03] border border-white/10 rounded-lg"
      >
        <input
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="bg-white/[0.06] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#E8B34C]/50"
        />
        <input
          placeholder="Artista"
          value={form.artist}
          onChange={(e) => setForm({ ...form, artist: e.target.value })}
          required
          className="bg-white/[0.06] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#E8B34C]/50"
        />
        <input
          placeholder="Álbum (opcional)"
          value={form.album}
          onChange={(e) => setForm({ ...form, album: e.target.value })}
          className="bg-white/[0.06] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#E8B34C]/50"
        />
        <input
          placeholder="Duración (segundos)"
          type="number"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          required
          className="bg-white/[0.06] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#E8B34C]/50"
        />
        <input
          placeholder="src (/music/cancion.mp3)"
          value={form.src}
          onChange={(e) => setForm({ ...form, src: e.target.value })}
          required
          className="bg-white/[0.06] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#E8B34C]/50"
        />
        <input
          placeholder="cover (/covers/cancion.jpg, opcional)"
          value={form.cover}
          onChange={(e) => setForm({ ...form, cover: e.target.value })}
          className="bg-white/[0.06] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#E8B34C]/50"
        />

        {error && <p className="md:col-span-3 text-xs text-red-400">{error}</p>}

        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-[#E8B34C] text-[#0B0B0D] text-sm font-semibold rounded-md hover:scale-[1.02] transition-transform"
          >
            {editingId ? 'Guardar cambios' : 'Agregar canción'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-white/[0.06] text-sm rounded-md hover:bg-white/[0.1] transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-[#6E6B67]">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-1">
          {songs.map((song) => (
            <div
              key={song.id}
              className="grid grid-cols-[40px_1fr_1fr_80px_auto] items-center gap-4 px-3 py-2.5 rounded-md hover:bg-white/[0.04]"
            >
              <div className="h-10 w-10 overflow-hidden rounded bg-white/[0.06]">
                {song.cover && (
                  <Image
                    src={song.cover}
                    alt={`${song.title} - portada`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    width={40}
                    height={40}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-[#9A9691] truncate">{song.artist}</p>
              </div>
              <span className="text-sm text-[#9A9691] truncate">{song.album ?? '—'}</span>
              <span className="text-sm text-[#9A9691] font-mono">{song.duration}s</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(song)}
                  className="text-xs px-2 py-1 bg-white/[0.06] rounded hover:bg-white/[0.12] transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(song.id)}
                  className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}