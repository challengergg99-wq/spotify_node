import { pool } from '@/lib/db';

// Sin esto, Next.js la generaría estática en el build y los contadores quedarían congelados.
export const dynamic = 'force-dynamic';

async function getCounts() {
  const [users, songs, playlists] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM users'),
    pool.query('SELECT COUNT(*)::int AS count FROM songs'),
    pool.query('SELECT COUNT(*)::int AS count FROM playlists'),
  ]);
  return {
    users: users.rows[0].count,
    songs: songs.rows[0].count,
    playlists: playlists.rows[0].count,
  };
}

export default async function AdminDashboard() {
  const counts = await getCounts();

  const cards = [
    { label: 'Usuarios', value: counts.users },
    { label: 'Canciones', value: counts.songs },
    { label: 'Playlists', value: counts.playlists },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-display)]">Resumen</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="p-6 bg-white/[0.03] border border-white/10 rounded-lg">
            <p className="text-xs uppercase tracking-widest text-[#9A9691] mb-2">{card.label}</p>
            <p className="text-3xl font-black text-[#E8B34C]">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}