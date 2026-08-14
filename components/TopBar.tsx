import Link from 'next/link';

export default function TopBar() {
  return (
    <div className="flex items-center justify-end px-6 pt-4">
      <Link
        href="/profile"
        aria-label="Ir a mi perfil"
        className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[#F5F3EE] transition-colors"
      >
        <span className="text-sm">👤</span>
      </Link>
    </div>
  );
}