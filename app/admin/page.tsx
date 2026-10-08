import Link from 'next/link';
import { pool } from '@/lib/db';

export default async function AdminDashboardPage() {
  const [users, songs, playlists] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM users'),
    pool.query('SELECT COUNT(*)::int AS total FROM songs'),
    pool.query('SELECT COUNT(*)::int AS total FROM playlists'),
  ]);

  const metrics = [
    { label: 'Usuarios', value: users.rows[0].total, href: '/admin/users' },
    { label: 'Canciones', value: songs.rows[0].total, href: '/admin/songs' },
    { label: 'Playlists', value: playlists.rows[0].total, href: '/admin/playlists' },
  ];

  return (
    <div>
      <header className="mb-8 border-b border-white/[0.08] pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#E8B34C]">Administración</p>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">Resumen</h1>
      </header>
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumen del sistema">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="border-l-2 border-[#E8B34C] bg-white/[0.03] px-5 py-4 hover:bg-white/[0.06]"
          >
            <p className="text-sm text-[#9A9691]">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{metric.value}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}