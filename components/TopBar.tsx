'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type User = { nombre: string; correo: string } | null;

export default function TopBar() {
  const [user, setUser] = useState<User | undefined>(undefined); // undefined = cargando

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  return (
    <div className="flex items-center justify-end px-6 pt-4">
      <Link
        href="/profile"
        aria-label="Ir a mi perfil"
        className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[#F5F3EE] text-sm font-bold transition-colors"
      >
        {user ? user.nombre.charAt(0).toUpperCase() : '👤'}
      </Link>
    </div>
  );
}