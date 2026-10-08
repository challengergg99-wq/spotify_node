'use client';

import { usePlayer, type Song } from '@/lib/player-context';
import AddToPlaylistMenu from './AddToPlaylistMenu';

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
  management,
}: {
  song: Song;
  index: number;
  queue: Song[];
  management?: {
    moveUp: () => void;
    moveDown: () => void;
    remove: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    disabled: boolean;
  };
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
    <div
      onClick={handleClick}
      className={`w-full grid grid-cols-[32px_1fr_1fr_80px_56px] items-center gap-4 px-3 py-2.5 rounded-md text-left transition-colors group cursor-pointer ${
        isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
      }`}
    >
      <span className="text-sm text-[#6E6B67] group-hover:hidden">
        {isActive && isPlaying ? '♪' : index + 1}
      </span>
      <span className="text-sm text-[#F5F3EE] hidden group-hover:inline">
        {isActive && isPlaying ? '⏸' : '▶'}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-white/[0.06]">
          {song.cover && (
            <img
              src={song.cover}
              alt={`${song.title} - portada`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-[#E8B34C]' : 'text-[#F5F3EE]'}`}>
            {song.title}
          </p>
          <p className="text-xs text-[#9A9691] truncate">{song.artist}</p>
        </div>
      </div>

      <span className="text-sm text-[#9A9691] truncate hidden md:block">{song.album}</span>

      {management ? (
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label={`Mover ${song.title} hacia arriba`}
            title="Mover arriba"
            disabled={management.disabled || !management.canMoveUp}
            onClick={management.moveUp}
            className="w-6 h-6 rounded text-xs text-[#9A9691] hover:text-[#F5F3EE] disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Mover ${song.title} hacia abajo`}
            title="Mover abajo"
            disabled={management.disabled || !management.canMoveDown}
            onClick={management.moveDown}
            className="w-6 h-6 rounded text-xs text-[#9A9691] hover:text-[#F5F3EE] disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            aria-label={`Quitar ${song.title} de la playlist`}
            title="Quitar de la playlist"
            disabled={management.disabled}
            onClick={management.remove}
            className="w-6 h-6 rounded text-base text-[#9A9691] hover:text-red-300 disabled:opacity-30"
          >
            ×
          </button>
        </div>
      ) : (
        <AddToPlaylistMenu songId={Number(song.id)} />
      )}

      <span className="text-sm text-[#9A9691] text-right font-mono">
        {formatDuration(song.duration)}
      </span>
    </div>
  );
}