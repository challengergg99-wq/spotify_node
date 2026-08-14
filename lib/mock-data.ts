export type MockAlbum = {
  id: string;
  title: string;
  subtitle: string;
};

export type Song ={
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  cover:string;
}

export const SONGS: Song[] = [
  { id: 's1', title: 'Canción 1', artist: 'Artista 1', album: 'Álbum A', duration: 214, src: '/music/1/01.mp3',cover:"/covers/deep_purple_splat-portada.jpg" },
  { id: 's2', title: 'Canción 2', artist: 'Artista 1', album: 'Álbum A', duration: 187, src: '/music/1/02.mp3',cover:"/covers/deep_purple_splat-portada.jpg"},
  { id: 's3', title: 'Canción 3', artist: 'Artista 2', album: 'Álbum B', duration: 245, src: '/music/1/03.mp3',cover:"/covers/francisca_valenzuela_maldita-portada.jpg"},
  { id: 's4', title: 'Canción 4', artist: 'Artista 3', album: 'Álbum C', duration: 198, src: '/music/1/04.mp3',cover:"/covers/muse_unravelling-portada.jpg"},
  { id: 's5', title: 'Canción 5', artist: 'Artista 2', album: 'Álbum B', duration: 231, src: '/music/1/05.mp3',cover:"/covers/the_temper_trap_sungazer-portada.jpg"},
  { id: 's6', title: 'Canción 6', artist: 'Artista 2', album: 'Álbum B', duration: 225, src: '/music/2/01.mp3',cover:"/covers/the_temper_trap_sungazer-portada.jpg"},
  { id: 's7', title: 'Canción 7', artist: 'Artista 3', album: 'Álbum B', duration: 115, src: '/music/2/02.mp3',cover:"/covers/the_temper_trap_sungazer-portada.jpg"},
  { id: 's8', title: 'Canción 8', artist: 'Artista 3', album: 'Álbum B', duration: 211, src: '/music/2/03.mp3',cover:"/covers/the_temper_trap_sungazer-portada.jpg"},
  { id: 's9', title: 'Canción 9', artist: 'Artista 2', album: 'Álbum B', duration: 215, src: '/music/2/04.mp3',cover:"/covers/the_temper_trap_sungazer-portada.jpg"},
  { id: 's10', title: 'Canción 10', artist: 'Artista 2', album: 'Álbum B', duration: 121, src: '/music/2/05.mp3',cover:"/covers/the_temper_trap_sungazer-portada.jpg"},
]




export type Playlist ={
  id: string;
  name: string;
  description: string;
  songIds: string[];
}

export const PLAYLISTS: Playlist[] =[
  { id: '1', name: 'Favoritos', description: 'Tus canciones más escuchadas', songIds: ['s1', 's2', 's3'] },
  { id: '2', name: 'Para programar', description: 'Foco y concentración', songIds: ['s4', 's5'] },
  { id: '3', name: 'Descubrimientos', description: 'Cosas nuevas que estás probando', songIds: ['s3', 's6'] },
  { id: '4', name: 'Road trip', description: 'Para el viaje', songIds: ['s1', 's4', 's6'] },
]

export const RECENTLY_PLAYED: MockAlbum[] = [
  { id: 'r1', title: 'Noches de código', subtitle: 'Playlist' },
  { id: 'r2', title: 'Lo-fi para enfocarse', subtitle: 'Playlist' },
  { id: 'r3', title: 'Indie 2026', subtitle: 'Playlist' },
  { id: 'r4', title: 'Favoritos', subtitle: 'Playlist' },
  { id: 'r5', title: 'Descubrimientos', subtitle: 'Playlist' },
  { id: 'r6', title: 'Road trip', subtitle: 'Playlist' },
];

export const MADE_FOR_YOU: MockAlbum[] = [
  { id: 'm1', title: 'Mix diario 1', subtitle: 'Basado en tu actividad' },
  { id: 'm2', title: 'Mix diario 2', subtitle: 'Basado en tu actividad' },
  { id: 'm3', title: 'Repetición', subtitle: 'Canciones que repetís' },
  { id: 'm4', title: 'Nuevos lanzamientos', subtitle: 'Para vos' },
  { id: 'm5', title: 'Deep focus', subtitle: 'Instrumental' },
];

