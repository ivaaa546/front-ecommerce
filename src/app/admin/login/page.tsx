'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/services/api';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetcher<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', res.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl  border border-gray-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Bienvenido de nuevo.</h1>
        <p className="text-gray-500 text-sm mt-2">Inicia sesión para gestionar tu tienda.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          id="admin-email"
          autoComplete="username"
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="admin-password"
          autoComplete="current-password"
          label="Contraseña"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</p>}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </Button>
      </form>
      <a href="/" className="mt-6 inline-flex min-h-11 items-center text-sm text-neutral-500 hover:text-primary">Volver a la tienda</a>
    </div>
  );
}
