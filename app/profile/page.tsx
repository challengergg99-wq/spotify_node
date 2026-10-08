'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type User = { nombre: string; correo: string; isAdmin: boolean };

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = cargando

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (user === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-[#6E6B67]">Cargando...</p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#9A9691]">No iniciaste sesión.</p>
        <a
          href="/login"
          className="px-5 py-2.5 bg-[#E8B34C] text-[#0B0B0D] text-sm font-semibold rounded-full hover:scale-105 transition-transform"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 bg-gradient-to-b from-[#17171A] to-[#0B0B0D]">
      <h1 className="text-2xl font-bold text-[#F5F3EE] mb-6 font-[family-name:var(--font-display)]">
        Mi perfil
      </h1>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-white/[0.08] flex items-center justify-center text-2xl font-bold text-[#F5F3EE]">
          {user.nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-[#F5F3EE]">{user.nombre}</p>
          <p className="text-sm text-[#9A9691]">{user.correo}</p>
        </div>
      </div>

      {user.isAdmin && (
        <Link
          href="/admin"
          className="mb-4 inline-flex rounded-md border border-[#E8B34C]/40 px-4 py-2.5 text-sm font-semibold text-[#E8B34C] hover:bg-[#E8B34C]/10"
        >
          Abrir panel de administración
        </Link>
      )}

      <button
        onClick={handleLogout}
        className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-[#F5F3EE] text-sm font-semibold rounded-full transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  );
}