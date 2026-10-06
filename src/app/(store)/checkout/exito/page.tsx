'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

import { useCartStore } from '@/store/useCartStore';
import { trackMetaEvent } from '@/lib/metaPixel';

function ExitoContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    const order = searchParams.get('order');
    setOrderNumber(order);
    if (order) {
      clearCart();
      const trackedKey = `meta-purchase-${order}`;
      if (!sessionStorage.getItem(trackedKey)) {
        const purchaseValue = sessionStorage.getItem(`meta-purchase-value-${order}`);
        trackMetaEvent('Purchase', { content_type: 'product', order_id: order, value: purchaseValue ? Number(purchaseValue) : undefined, currency: 'GTQ' });
        sessionStorage.setItem(trackedKey, '1');
        sessionStorage.removeItem(`meta-purchase-value-${order}`);
      }
    }
  }, [searchParams, clearCart]);

  if (!orderNumber) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Información no disponible</h1>
        <p className="text-gray-500 mb-6">No se encontró un número de orden válido en la URL.</p>
        <Link href="/productos">
          <Button>Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-neutral-500" />
        </div>

        <h1 className="text-3xl font-bold text-primary mb-4">¡Pedido Confirmado!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Gracias por tu compra. Hemos recibido tu pedido y pronto nos comunicaremos contigo.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 inline-block text-left w-full max-w-md">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Número de orden</p>
          <p className="text-3xl font-bold text-neutral-600">{orderNumber}</p>
        </div>

        <div className="text-left bg-neutral-50 border border-neutral-100 p-4 rounded-md mb-8">
          <h3 className="font-semibold text-neutral-800 mb-2">Siguientes pasos:</h3>
          <ul className="list-disc list-inside text-neutral-700 space-y-1 text-sm">
            <li>Prepararemos tus productos inmediatamente.</li>
            <li>Recibirás tu paquete en un plazo de 1 a 3 días hábiles.</li>
            <li>Recuerda tener el monto exacto en efectivo al momento de la entrega.</li>
          </ul>
        </div>

        <Link href="/">
          <Button size="lg">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutExitoPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Cargando información del pedido...</div>}>
      <ExitoContent />
    </Suspense>
  );
}
