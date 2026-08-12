'use client';

import { usePlayer, type Song } from '@/lib/player-context';

export default function PlayAllButton({ songs }: { songs: Song[] }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();

  const isThisQueuePlaying = isPlaying && songs.some((s) => s.id === currentSong?.id);

  const handleClick = () => {
    if (isThisQueuePlaying) {
      togglePlay();
      return;
    }
    if (songs[0]) playSong(songs[0], songs);
  };

  return (
    <button
      onClick={handleClick}
      disabled={songs.length === 0}
      className="w-14 h-14 rounded-full bg-[#E8B34C] text-[#0B0B0D] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 shadow-lg shadow-black/40 text-lg"
      aria-label={isThisQueuePlaying ? 'Pausar' : 'Reproducir todo'}
    >
      {isThisQueuePlaying ? '⏸' : '▶'}
    </button>
  );
}