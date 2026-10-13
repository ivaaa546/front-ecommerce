'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetcher } from '@/services/api';
import { Badge } from '@/components/ui/BadgeCard';
import { Pagination } from '@/components/ui/Pagination';
import { Search, X } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: string;
  status: 'PENDIENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'ENVIADO' | 'RETORNANDO' | 'ENTREGADO' | 'CANCELADO' | 'DEVUELTO';
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetcher<Order[]>('/admin/orders', { requireAuth: true })
      .then(setOrders)
      .catch(err => setError(err.message || 'No pudimos cargar los pedidos'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'default';
      case 'CONFIRMADO': return 'info';
      case 'PREPARANDO': return 'warning';
      case 'ENVIADO': return 'success';
      case 'RETORNANDO': return 'warning';
      case 'ENTREGADO': return 'success';
      case 'CANCELADO': return 'danger';
      case 'DEVUELTO': return 'warning';
      default: return 'default';
    }
  };

  if (loading) return <div>Cargando...</div>;

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'TODOS' || o.status === filter;
    if (!matchesFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchNumber = o.orderNumber.toLowerCase().includes(q);
    const matchCustomer = o.customerName.toLowerCase().includes(q);
    return matchNumber || matchCustomer;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Pedidos</h1>

      <p className="-mt-5 mb-6 text-sm text-neutral-500">Gestiona los pedidos de tu tienda y consulta su estado.</p>
      {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}. Recarga la página para volver a intentarlo.</p>}

      {/* Buscador y filtros de pedidos */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative min-w-[280px] max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por número de orden (#0001) o cliente..."
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

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar pedidos por estado">
          {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'RETORNANDO', 'ENTREGADO', 'CANCELADO', 'DEVUELTO'].map(status => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1); }}
              aria-pressed={filter === status}
              className={`min-h-11 rounded-lg px-4 text-sm font-medium transition-colors ${
                filter === status ? 'bg-primary text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
               {({TODOS:'Todos', PENDIENTE:'Pendientes', CONFIRMADO:'Confirmados', PREPARANDO:'En preparación', ENVIADO:'Enviados', RETORNANDO:'Retornando', ENTREGADO:'Entregados', CANCELADO:'Cancelados', DEVUELTO:'Devueltos'} as Record<string,string>)[status]}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-gray-600">Orden</th>
              <th className="p-4 text-gray-600">Fecha</th>
              <th className="p-4 text-gray-600">Cliente</th>
              <th className="p-4 text-gray-600">Total</th>
              <th className="p-4 text-gray-600">Estado</th>
              <th className="p-4 text-gray-600">Acción</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-accent">{o.orderNumber}</td>
                <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-gray-800">{o.customerName}</td>
                <td className="p-4 font-medium text-primary">Q {parseFloat(o.total).toFixed(2)}</td>
                <td className="p-4">
                  <Badge variant={getStatusColor(o.status) as any}>{o.status}</Badge>
                </td>
                <td className="p-4">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-neutral-600 hover:underline font-medium">
                    Gestionar
                  </Link>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  {search ? `No se encontraron pedidos para "${search}".` : 'No hay pedidos.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
