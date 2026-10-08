'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  nombre?: string;
  apellido?: string;
  correo?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial (@$!%*?&)';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          correo: formData.correo.trim(),
          password: formData.password,
        }),
      });

      let data: { message?: string } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Error al registrarse. Intenta nuevamente.');
      }

      setSuccessMessage(data?.message || 'Usuario registrado correctamente');

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al registrarse. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex flex-col justify-between">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <h2 className="text-3xl font-bold mb-2 text-center text-white">Crear Cuenta</h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-300 text-sm">
              ✗ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-600 rounded-lg text-green-300 text-sm">
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-purple-500'
                }`}
                placeholder="Ingresa tu nombre"
              />
              {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.apellido ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-purple-500'
                }`}
                placeholder="Ingresa tu apellido"
              />
              {errors.apellido && <p className="text-red-400 text-xs mt-1">{errors.apellido}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.correo ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-purple-500'
                }`}
                placeholder="correo@ejemplo.com"
              />
              {errors.correo && <p className="text-red-400 text-xs mt-1">{errors.correo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-purple-500'
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              <p className="text-gray-500 text-xs mt-1">Mín 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Repetir Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-purple-500'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 mt-6"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p className="text-gray-400 text-center text-sm mt-4">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-purple-400 hover:text-purple-300">
              Inicia sesión
            </a>
          </p>
        </div>
      </main>

      <footer className="bg-zinc-800/50 backdrop-blur-md p-4 text-center text-gray-400 text-sm border-t border-zinc-700">
        © {new Date().getFullYear()} Todos los derechos reservados.
      </footer>
    </div>
  );
}