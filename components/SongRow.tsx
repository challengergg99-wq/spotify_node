'use client';

import { usePlayer, type Song } from '@/lib/player-context';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function SongRow({
  song,
  index,
  queue,
}: {
  song: Song;
  index: number;
  queue: Song[];
}) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handleClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full grid grid-cols-[32px_48px_1fr_1fr_56px] items-center gap-4 px-3 py-2.5 rounded-md text-left transition-colors group ${
        isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
      }`}
    >
      <span className="text-sm text-[#6E6B67] group-hover:hidden">
        {isActive && isPlaying ? '♪' : index + 1}
      </span>
      <span className="text-sm text-[#F5F3EE] hidden group-hover:inline">
        {isActive && isPlaying ? '⏸' : '▶'}
      </span>

      <div className="w-12 h-12 rounded-md overflow-hidden bg-white/[0.04] border border-white/[0.06] shrink-0">
        {song.cover ? (
          <img src={song.cover} alt={song.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.08] to-transparent" />
        )}
      </div>

      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-[#E8B34C]' : 'text-[#F5F3EE]'}`}>
          {song.title}
        </p>
        <p className="text-xs text-[#9A9691] truncate">{song.artist}</p>
      </div>

      <span className="text-sm text-[#9A9691] truncate hidden md:block">{song.album}</span>

      <span className="text-sm text-[#9A9691] text-right font-mono">
        {formatDuration(song.duration)}
      </span>
    </button>
  );
}