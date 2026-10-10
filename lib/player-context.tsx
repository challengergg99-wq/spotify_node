'use client';

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  src: string; // path under /public, e.g. "/music/song-1.mp3"
  cover?: string;
};

type PlayerContextType = {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  progress: number; // seconds
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Crea el elemento <audio> una sola vez (solo existe en el navegador)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (newQueue) setQueue(newQueue);
    setCurrentSong(song);
    audio.src = song.src;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // El navegador puede bloquear autoplay hasta que haya interacción del usuario
    });
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const next = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const nextSong = queue[idx + 1];
    if (nextSong) playSong(nextSong, queue);
  }, [currentSong, queue, playSong]);

  // Escucha el progreso y el fin de la canción. Va DESPUÉS de `next` y depende de él,
  // así siempre usa la cola y la canción actuales (sin closures viejos).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onEnded = () => next();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [next]);

  const prev = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const prevSong = queue[idx - 1];
    if (prevSong) playSong(prevSong, queue);
  }, [currentSong, queue, playSong]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setProgress(seconds);
  }, []);

  return (
    <PlayerContext.Provider
      value={{ currentSong, queue, isPlaying, progress, playSong, togglePlay, next, prev, seek }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer debe usarse dentro de <PlayerProvider>');
  return ctx;
}