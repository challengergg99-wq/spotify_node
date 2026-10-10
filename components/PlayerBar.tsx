'use client';

import { usePlayer } from '../lib/player-context';
import Image from 'next/image';

function formatTime(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function PlayerBar() {
  const { currentSong, isPlaying, progress, togglePlay, next, prev, seek } = usePlayer();
 
  const progressPct = currentSong ? (progress / currentSong.duration) * 100 : 0;
 
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSong) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * currentSong.duration);
  };

  return (
    <footer className="h-[88px] shrink-0 bg-[#0B0B0D] border-t border-white/[0.06] px-4 flex items-center gap-4">
      {/* Now playing */}
      <div className="flex items-center gap-3 w-[280px] min-w-0">
        <div className="relative w-14 h-14 rounded-md shrink-0 overflow-hidden bg-white/[0.04] border border-white/[0.06]">
          {/* Signature: warm glow behind cover art when a track is active */}
          {isPlaying && (
            <div className="absolute -inset-2 bg-[#E8B34C]/25 blur-lg rounded-full" />
          )}
          {currentSong?.cover ? (
            <Image src={currentSong.cover} alt={currentSong.title} className="relative h-full w-full object-cover" width={56} height={56}/>
          ) : (
            <div className="relative w-full h-full rounded-md bg-gradient-to-br from-white/[0.06] to-transparent" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#F5F3EE] truncate">{currentSong?.title ?? 'Sin canción'}</p>
          <p className="text-xs text-[#9A9691] truncate">{currentSong?.artist}</p>
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-[640px] mx-auto">
        <div className="flex items-center gap-5">
          <button
          onClick={prev}
          disabled={!currentSong}
          aria-label="Anterior"
          className="text-[#9A9691] hover:text-[#F5F3EE] transition-colors text-sm"
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            disabled={!currentSong}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className="w-8 h-8 rounded-full bg-[#F5F3EE] text-[#0B0B0D] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100 text-sm"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={next}
            disabled={!currentSong}
            aria-label="Siguiente"
            className="text-[#9A9691] hover:text-[#F5F3EE] transition-colors text-sm"
          >
            ⏭
          </button>
        </div>

        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] text-[#6E6B67] font-mono w-9 text-right">{formatTime(progress)}</span>

          <div onClick={handleSeek} className="flex-1 h-1 rounded-full bg-white/[0.08] overflow-hidden group cursor-pointer">
            <div
              className="h-full bg-[#DCD9D3] group-hover:bg-[#E8B34C] transition-colors"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#6E6B67] font-mono w-9">{formatTime(currentSong?.duration ?? 0)}</span>
        </div>
      </div>

      {/* Volume / extra (placeholder for now) */}
      <div className="w-[280px] hidden md:flex justify-end">
        <div className="w-24 h-1 rounded-full bg-white/[0.08]">
          <div className="w-2/3 h-full rounded-full bg-[#DCD9D3]" />
        </div>
      </div>
    </footer>
  );
}