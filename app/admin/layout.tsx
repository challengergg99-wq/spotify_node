import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/require-admin';

const TABS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/songs', label: 'Canciones' },
  { href: '/admin/users', label: 'Usuarios' },
  { href: '/admin/playlists', label: 'Playlists' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect('/');

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#0B0B0D] text-[#F5F3EE]">
      <header className="shrink-0 border-b border-white/[0.06] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <span className="font-[family-name:var(--font-display)] font-bold text-lg">
            Panel de administración
          </span>
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-3 py-1.5 rounded-md text-sm text-[#9A9691] hover:text-[#F5F3EE] hover:bg-white/[0.06] transition-colors"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/" className="text-sm text-[#9A9691] hover:text-[#F5F3EE] transition-colors">
          ← Volver a la app
        </Link>
      </header>

      <main className="w-full max-w-6xl flex-1 min-h-0 overflow-y-auto px-6 py-8 mx-auto">{children}</main>
    </div>
  );
}