'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetcher } from '@/services/api';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/BadgeCard';
import ShareProductButton from '@/components/features/ShareProductButton';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      // Usamos el endpoint publico sin filtros o el admin (si existe) para listar todos
      const data = await fetcher<Product[]>('/admin/products', { requireAuth: true });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    try {
      await fetcher(`/admin/products/${id}/status`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({ status: current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
      });
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await fetcher(`/admin/products/${id}/featured`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({ featured: !current }),
      });
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>+ Nuevo Producto</Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-gray-600">Producto</th>
              <th className="p-4 text-gray-600">Precio</th>
              <th className="p-4 text-gray-600">Stock</th>
              <th className="p-4 text-gray-600">Categoría</th>
              <th className="p-4 text-gray-600">Estado</th>
              <th className="p-4 text-gray-600">Destacado</th>
              <th className="p-4 text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  <span className="font-medium text-primary">{p.name}</span>
                </td>
                <td className="p-4 text-gray-600">Q {parseFloat(p.price).toFixed(2)}</td>
                <td className="p-4 font-mono">{p.stock}</td>
                <td className="p-4 text-gray-500">{p.category?.name}</td>
                <td className="p-4 cursor-pointer" onClick={() => toggleStatus(p.id, p.status)}>
                  <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'}>{p.status}</Badge>
                </td>
                <td className="p-4 cursor-pointer" onClick={() => toggleFeatured(p.id, p.featured)}>
                  <Badge variant={p.featured ? 'warning' : 'default'}>{p.featured ? 'Sí' : 'No'}</Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/productos/editar/${p.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      Editar
                    </Link>
                    <ShareProductButton
                      productName={p.name}
                      productSlug={p.slug}
                      price={p.price}
                      variant="admin"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
