'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetcher } from '@/services/api';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/BadgeCard';
import { Pagination } from '@/components/ui/Pagination';
import ShareProductButton from '@/components/features/ShareProductButton';
import { ArrowUpRight, Search, X } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = p.name.toLowerCase().includes(q);
    const matchSku = p.sku.toLowerCase().includes(q);
    const matchCategory = p.category?.name?.toLowerCase().includes(q);
    const matchVariants = p.variants?.some(
      (v) => v.name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q)
    );
    return matchName || matchSku || matchCategory || matchVariants;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-primary">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>+ Nuevo Producto</Button>
        </Link>
      </div>

      {/* Buscador de productos */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative min-w-[280px] max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
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
            {paginatedProducts.map((p) => {
              const priceNum = parseFloat(p.price);
              const hasVariants = Boolean(p.variants && p.variants.length > 0);
              const totalStock = hasVariants
                ? p.variants!.reduce((acc, v) => acc + (v.stock || 0), 0)
                : p.stock;

              return (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border shrink-0" />
                    <span className="font-medium text-primary line-clamp-1">{p.name}</span>
                  </td>
                  <td className="p-4 whitespace-nowrap tabular-nums text-neutral-800 font-medium">
                    Q {priceNum.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-neutral-900 text-sm">
                        {totalStock}
                      </span>
                      {hasVariants && (
                        <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {p.variants!.length} var.
                        </span>
                      )}
                      {totalStock === 0 ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          Agotado
                        </span>
                      ) : totalStock <= 5 ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Bajo
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={`/admin/inventario?search=${encodeURIComponent(p.sku)}`}
                      className="inline-flex items-center gap-0.5 text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors mt-0.5"
                      title="Gestionar existencias en el módulo de Inventario"
                    >
                      <span>Inventario</span>
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">{p.category?.name || '—'}</td>
                  <td className="p-4 whitespace-nowrap">
                    <button type="button" className="min-h-11" onClick={() => toggleStatus(p.id, p.status)} aria-label={`Cambiar estado de ${p.name}`}>
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'}>{p.status}</Badge>
                    </button>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <button type="button" className="min-h-11" onClick={() => toggleFeatured(p.id, p.featured)} aria-label={`Cambiar destacado de ${p.name}`}>
                      <Badge variant={p.featured ? 'warning' : 'default'}>{p.featured ? 'Sí' : 'No'}</Badge>
                    </button>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/productos/editar/${p.id}`} className="text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors">
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
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {search ? `No se encontraron productos que coincidan con "${search}".` : 'No hay productos registrados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
