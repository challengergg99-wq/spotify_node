'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }

      // La cookie de sesión ya la seteó /api/login (httpOnly) — solo redirigimos.
      router.push('/');
      router.refresh();
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex flex-col justify-between">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <h2 className="text-3xl font-bold mb-2 text-center text-white">Iniciar Sesión</h2>
          <p className="text-gray-400 text-center mb-6 text-sm">Accede a tu cuenta</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-300 text-sm">
              ✗ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 mt-6"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-gray-400 text-center text-sm mt-4">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-purple-400 hover:text-purple-300">
              Regístrate
            </a>
          </p>
        </div>
      </main>

      <footer className="bg-zinc-800/50 backdrop-blur-md p-4 text-center text-gray-400 text-sm border-t border-zinc-700">
        © {new Date().getFullYear()} MiAplicación - Todos los derechos reservados.
      </footer>
    </div>
  );
}