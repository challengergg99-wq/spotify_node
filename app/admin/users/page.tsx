'use client';

import { useEffect, useState } from 'react';

type User = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  is_admin: boolean;
  created_at: string;
  playlist_count: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadUsers = () => {
    fetch('/api/admin/users')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'No se pudo cargar la lista de usuarios.');
        setUsers(data.users ?? []);
        setError('');
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Error de conexión.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeAdminRole = async (user: User) => {
    setBusyId(user.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !user.is_admin }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'No se pudo cambiar el rol.');
      loadUsers();
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : 'Error de conexión.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`¿Eliminar la cuenta de ${user.nombre} (${user.correo})?`)) return;
    setBusyId(user.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'No se pudo eliminar el usuario.');
      loadUsers();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Error de conexión.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-[family-name:var(--font-display)]">Usuarios</h1>
      {error && <p className="mb-4 text-sm text-red-300" role="alert">{error}</p>}

      {loading ? (
        <p className="text-sm text-[#6E6B67]" role="status">Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-[#6E6B67]">No hay usuarios para mostrar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs text-[#6E6B67]">
              <tr>
                <th className="px-3 py-2 font-medium">Usuario</th>
                <th className="px-3 py-2 font-medium">Correo</th>
                <th className="px-3 py-2 font-medium">Playlists</th>
                <th className="px-3 py-2 font-medium">Rol</th>
                <th className="px-3 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-3">{user.nombre} {user.apellido}</td>
                  <td className="px-3 py-3 text-[#9A9691]">{user.correo}</td>
                  <td className="px-3 py-3 tabular-nums">{user.playlist_count}</td>
                  <td className="px-3 py-3">{user.is_admin ? 'Administrador' : 'Usuario'}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => void changeAdminRole(user)}
                        className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/[0.06] disabled:opacity-50"
                      >
                        {user.is_admin ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => void deleteUser(user)}
                        className="rounded border border-red-400/30 px-2 py-1 text-xs text-red-300 hover:bg-red-400/10 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}