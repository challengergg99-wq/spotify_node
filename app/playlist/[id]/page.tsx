import { notFound, redirect } from 'next/navigation';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/get-session';
import SongRow from '@/components/SongRow';
import PlayAllButton from '@/components/PlayAllButton';
import type { Song } from '@/lib/player-context';

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect('/login');

  const playlistResult = await pool.query(
    'SELECT id, name, description FROM playlists WHERE id = $1 AND user_id = $2',
    [id, session.userId]
  );
  const playlist = playlistResult.rows[0];
  if (!playlist) return notFound();

  const songsResult = await pool.query(
    `SELECT s.id, s.title, s.artist, s.album, s.duration, s.src, s.cover
     FROM playlist_songs ps
     JOIN songs s ON s.id = ps.song_id
     WHERE ps.playlist_id = $1
     ORDER BY ps.position ASC, ps.added_at ASC`,
    [playlist.id]
  );
  const songs = songsResult.rows as Song[];

  const totalMinutes = Math.round(songs.reduce((acc, s) => acc + s.duration, 0) / 60);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#17171A] to-[#0B0B0D]">
      <div className="flex items-end gap-6 px-6 pt-10 pb-6">
        <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-[#E8B34C]/30 to-white/[0.04] shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9A9691] mb-2">Playlist</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F5F3EE] mb-3 font-[family-name:var(--font-display)] truncate">
            {playlist.name}
          </h1>
          <p className="text-sm text-[#9A9691]">
            {playlist.description ? `${playlist.description} · ` : ''}
            {songs.length} {songs.length === 1 ? 'canción' : 'canciones'} · {totalMinutes} min
          </p>
        </div>
      </div>

      <div className="px-6 pb-4">
        <PlayAllButton songs={songs} />
      </div>

      <div className="px-6 pb-10">
        {songs.length === 0 ? (
          <p className="text-sm text-[#6E6B67] px-3">
            Esta playlist todavía no tiene canciones. Andá a Buscar y agregá alguna.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[32px_1fr_1fr_36px_56px] gap-4 px-3 py-2 border-b border-white/[0.06] mb-2">
              <span className="text-xs text-[#6E6B67]">#</span>
              <span className="text-xs text-[#6E6B67]">Título</span>
              <span className="text-xs text-[#6E6B67] hidden md:block">Álbum</span>
              <span />
              <span className="text-xs text-[#6E6B67] text-right">⏱</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {songs.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} queue={songs} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}