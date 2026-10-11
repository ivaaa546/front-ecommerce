'use client';

import React, { useEffect, useState } from 'react';
import { fetcher } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/BadgeCard';
import Link from 'next/link';

export default function AdminOrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      const data = await fetcher(`/admin/orders/${params.id}`, { requireAuth: true });
      setOrder(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const advanceStatus = async () => {
    const sequence = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'];
    const currentIndex = sequence.indexOf(order.status);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) return;
    const nextStatus = sequence[currentIndex + 1];

    if (!confirm(`¿Avanzar pedido a ${nextStatus}?`)) return;

    try {
      await fetcher(`/admin/orders/${params.id}/status`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({ status: nextStatus }),
      });
      loadOrder();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('Indica el motivo de la cancelación:');
    if (reason === null) return; // cancelado por el usuario en prompt
    const finalReason = reason.trim() || 'Cancelado por administración';

    try {
      await fetcher(`/admin/orders/${params.id}/cancel`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ reason: finalReason, actor: 'ADMIN' }),
      });
      alert('Pedido cancelado y stock repuesto correctamente.');
      loadOrder();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar el pedido');
    }
  };

  const handleReturnOrder = async () => {
    const reason = prompt('Indica el motivo de la devolución:');
    if (reason === null) return;
    const finalReason = reason.trim() || 'Devolución procesada por administración';

    try {
      await fetcher(`/admin/orders/${params.id}/return`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ reason: finalReason, actor: 'ADMIN' }),
      });
      alert('Devolución registrada y stock repuesto al inventario correctamente.');
      loadOrder();
    } catch (err: any) {
      alert(err.message || 'Error al procesar la devolución');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!order) return <div>Pedido no encontrado</div>;

  const canCancel = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO'].includes(order.status);
  const canReturn = order.status === 'ENTREGADO';

  const badgeVariant =
    order.status === 'CANCELADO'
      ? 'danger'
      : order.status === 'DEVUELTO'
      ? 'warning'
      : order.status === 'ENTREGADO'
      ? 'success'
      : 'default';

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/admin/pedidos" className="text-sm text-gray-500 hover:text-accent">&larr; Volver a Pedidos</Link>
          <h1 className="text-3xl font-bold text-primary mt-2">Pedido {order.orderNumber}</h1>
        </div>
        <div className="text-right">
          <Badge variant={badgeVariant}>{order.status}</Badge>
          <div className="mt-4 flex items-center justify-end gap-2">
            {order.status !== 'ENTREGADO' && order.status !== 'CANCELADO' && order.status !== 'DEVUELTO' && (
              <Button onClick={advanceStatus}>Avanzar Estado</Button>
            )}
            {canCancel && (
              <Button variant="danger" onClick={handleCancelOrder}>
                Cancelar Pedido
              </Button>
            )}
            {canReturn && (
              <Button variant="outline" onClick={handleReturnOrder}>
                Procesar Devolución
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Información de Cancelación o Devolución si aplica */}
      {(order.status === 'CANCELADO' || order.status === 'DEVUELTO') && (
        <div className={`p-4 rounded-xl border mb-8 ${order.status === 'CANCELADO' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <h3 className="font-bold text-sm mb-1">
            {order.status === 'CANCELADO' ? 'Pedido Cancelado' : 'Pedido Devuelto'}
          </h3>
          <p className="text-xs">
            <strong>Motivo:</strong> {order.cancellationReason || order.returnReason || 'Sin motivo registrado'}
          </p>
          <div className="flex gap-4 text-xs mt-1 opacity-80">
            <span>
              <strong>Actor:</strong> {order.cancelledBy || order.returnedBy || 'ADMIN'}
            </span>
            <span>
              <strong>Fecha:</strong> {order.cancelledAt || order.returnedAt ? new Date(order.cancelledAt || order.returnedAt).toLocaleString('es-GT') : 'N/A'}
            </span>
            <span>
              <strong>Stock repuesto:</strong> {order.stockRestored ? 'Sí (100% restaurado)' : 'No'}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4 text-primary">Cliente</h2>
          <p><strong>Nombre:</strong> {order.customerName}</p>
          <p><strong>Teléfono:</strong> {order.customerPhone}</p>
          {order.customerEmail && <p><strong>Email:</strong> {order.customerEmail}</p>}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4 text-primary">Dirección de Entrega</h2>
          <p><strong>Depto/Muni:</strong> {order.department}, {order.municipality}</p>
          <p><strong>Dirección:</strong> {order.exactAddress}</p>
          {order.reference && <p><strong>Referencia:</strong> {order.reference}</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Precio U.</th>
              <th className="p-4">Cant.</th>
              <th className="p-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0">
                <td className="p-4">
                  <span className="font-medium text-gray-900 block">{item.productName}</span>
                  {item.sku && <span className="text-xs text-gray-500 font-mono">SKU: {item.sku}</span>}
                </td>
                <td className="p-4">Q {parseFloat(item.unitPrice).toFixed(2)}</td>
                <td className="p-4">{item.quantity}</td>
                <td className="p-4 text-right">Q {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-gray-50 p-6 border-t border-gray-200 text-right">
          <p className="text-gray-600 mb-2">Envío: Q {parseFloat(order.shippingCost).toFixed(2)}</p>
          <p className="text-xl font-bold text-primary">Total: Q {parseFloat(order.total).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
