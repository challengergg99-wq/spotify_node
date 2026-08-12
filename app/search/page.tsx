import { notFound } from 'next/navigation';
import { PLAYLISTS, SONGS } from '@/lib/mock-data'
import SongRow from '@/components/SongRow';
import PlayAllButton from '@/components/PlayAllButton';

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const playlist = PLAYLISTS.find((p) => p.id === params.id);
  if (!playlist) return notFound();

  const songs = playlist.songIds
    .map((id) => SONGS.find((s) => s.id === id))
    .filter((s): s is (typeof SONGS)[number] => Boolean(s));

  const totalMinutes = Math.round(songs.reduce((acc, s) => acc + s.duration, 0) / 60);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#17171A] to-[#0B0B0D]">
      {/* Header */}
      <div className="flex items-end gap-6 px-6 pt-10 pb-6">
        <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-[#E8B34C]/30 to-white/[0.04] shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9A9691] mb-2">
            Playlist
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F5F3EE] mb-3 font-[family-name:var(--font-display)] truncate">
            {playlist.name}
          </h1>
          <p className="text-sm text-[#9A9691]">
            {playlist.description} · {songs.length} canciones · {totalMinutes} min
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-4">
        <PlayAllButton songs={songs} />
      </div>

      {/* Song table */}
      <div className="px-6 pb-10">
        <div className="grid grid-cols-[32px_1fr_1fr_56px] gap-4 px-3 py-2 border-b border-white/[0.06] mb-2">
          <span className="text-xs text-[#6E6B67]">#</span>
          <span className="text-xs text-[#6E6B67]">Título</span>
          <span className="text-xs text-[#6E6B67] hidden md:block">Álbum</span>
          <span className="text-xs text-[#6E6B67] text-right">⏱</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} />
          ))}
        </div>
      </div>
    </div>
  );
}