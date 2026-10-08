'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SongRow from '@/components/SongRow';
import type { Song } from '@/lib/player-context';

type Playlist = { id: number; name: string; description: string | null };

async function getErrorMessage(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.message ?? 'No se pudo completar la operación.';
}

function notifyPlaylistsChanged() {
  window.dispatchEvent(new Event('playlists:updated'));
}

export default function PlaylistManager({
  playlist,
  initialSongs,
}: {
  playlist: Playlist;
  initialSongs: Song[];
}) {
  const router = useRouter();
  const [songs, setSongs] = useState(initialSongs);
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');

  const savePlaylist = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsMutating(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description.trim() || null }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setIsEditing(false);
      notifyPlaylistsChanged();
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la playlist.');
    } finally {
      setIsMutating(false);
    }
  };

  const deletePlaylist = async () => {
    if (!window.confirm(`¿Eliminar la playlist "${playlist.name}"? Esta acción no se puede deshacer.`)) return;
    setError('');
    setIsMutating(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      notifyPlaylistsChanged();
      router.push('/');
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la playlist.');
      setIsMutating(false);
    }
  };

  const saveOrder = async (nextSongs: Song[], previousSongs: Song[]) => {
    setSongs(nextSongs);
    setError('');
    setIsMutating(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}/songs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedSongIds: nextSongs.map((song) => Number(song.id)) }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      router.refresh();
    } catch (orderError) {
      setSongs(previousSongs);
      setError(orderError instanceof Error ? orderError.message : 'No se pudo guardar el orden.');
    } finally {
      setIsMutating(false);
    }
  };

  const moveSong = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= songs.length || isMutating) return;
    const nextSongs = [...songs];
    [nextSongs[index], nextSongs[targetIndex]] = [nextSongs[targetIndex], nextSongs[index]];
    void saveOrder(nextSongs, songs);
  };

  const removeSong = async (song: Song) => {
    if (!window.confirm(`¿Quitar "${song.title}" de esta playlist?`)) return;
    const previousSongs = songs;
    setSongs(songs.filter((item) => item.id !== song.id));
    setError('');
    setIsMutating(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}/songs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: Number(song.id) }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      notifyPlaylistsChanged();
      router.refresh();
    } catch (removeError) {
      setSongs(previousSongs);
      setError(removeError instanceof Error ? removeError.message : 'No se pudo quitar la canción.');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <section className="px-6 pb-10">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setIsEditing((editing) => !editing)}
          className="rounded-md border border-white/[0.1] px-3 py-2 text-sm text-[#DCD9D3] hover:bg-white/[0.06]"
        >
          {isEditing ? 'Cancelar edición' : 'Editar playlist'}
        </button>
        <button
          type="button"
          onClick={deletePlaylist}
          disabled={isMutating}
          className="rounded-md border border-red-400/30 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50"
        >
          Eliminar playlist
        </button>
      </div>

      {isEditing && (
        <form onSubmit={savePlaylist} className="mb-6 grid max-w-xl gap-3">
          <label className="grid gap-1 text-xs text-[#9A9691]">
            Nombre
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              required
              className="rounded-md border border-white/10 bg-[#17171A] px-3 py-2 text-sm text-[#F5F3EE] outline-none focus:border-[#E8B34C]"
            />
          </label>
          <label className="grid gap-1 text-xs text-[#9A9691]">
            Descripción
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              rows={3}
              className="resize-y rounded-md border border-white/10 bg-[#17171A] px-3 py-2 text-sm text-[#F5F3EE] outline-none focus:border-[#E8B34C]"
            />
          </label>
          <button
            type="submit"
            disabled={isMutating}
            className="w-fit rounded-md bg-[#E8B34C] px-4 py-2 text-sm font-semibold text-[#18181A] disabled:opacity-50"
          >
            Guardar cambios
          </button>
        </form>
      )}

      {error && <p className="mb-4 text-sm text-red-300" role="alert">{error}</p>}

      {songs.length === 0 ? (
        <p className="text-sm text-[#6E6B67] px-3">
          Esta playlist todavía no tiene canciones. Andá a Buscar y agregá alguna.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-[32px_1fr_1fr_80px_56px] gap-4 px-3 py-2 border-b border-white/[0.06] mb-2">
            <span className="text-xs text-[#6E6B67]">#</span>
            <span className="text-xs text-[#6E6B67]">Título</span>
            <span className="text-xs text-[#6E6B67] hidden md:block">Álbum</span>
            <span className="text-xs text-[#6E6B67]">Orden</span>
            <span className="text-xs text-[#6E6B67] text-right">Duración</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {songs.map((song, index) => (
              <SongRow
                key={song.id}
                song={song}
                index={index}
                queue={songs}
                management={{
                  moveUp: () => moveSong(index, -1),
                  moveDown: () => moveSong(index, 1),
                  remove: () => void removeSong(song),
                  canMoveUp: index > 0,
                  canMoveDown: index < songs.length - 1,
                  disabled: isMutating,
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}