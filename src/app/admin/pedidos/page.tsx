'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetcher } from '@/services/api';
import { Badge } from '@/components/ui/BadgeCard';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: string;
  status: 'PENDIENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGADO';
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<Order[]>('/admin/orders', { requireAuth: true })
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'default';
      case 'CONFIRMADO': return 'info';
      case 'PREPARANDO': return 'warning';
      case 'ENVIADO': return 'success';
      case 'ENTREGADO': return 'success';
      default: return 'default';
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Pedidos</h1>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-accent">{o.orderNumber}</td>
                <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-gray-800">{o.customerName}</td>
                <td className="p-4 font-medium text-primary">Q {parseFloat(o.total).toFixed(2)}</td>
                <td className="p-4">
                  <Badge variant={getStatusColor(o.status) as any}>{o.status}</Badge>
                </td>
                <td className="p-4">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-blue-600 hover:underline font-medium">
                    Gestionar
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay pedidos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
