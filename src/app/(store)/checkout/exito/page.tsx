'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle, AlertCircle, ShoppingBag, Truck } from 'lucide-react';
import { trackMetaEvent } from '@/lib/metaPixel';
import { AuthoritativeOrderResponse } from '@/types';

function ExitoContent() {
  const searchParams = useSearchParams();
  const [confirmedOrder, setConfirmedOrder] = useState<AuthoritativeOrderResponse | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    const orderParam = searchParams.get('order');

    if (!orderParam) {
      setErrorStatus('No se especificó un número de pedido en la dirección.');
      return;
    }

    // T-025, RN-016: Validar contra la respuesta autoritativa guardada en sesión
    try {
      const stored = sessionStorage.getItem('last-confirmed-order');
      if (!stored) {
        setErrorStatus('No se encontró un pedido confirmado en esta sesión. Si navegaste directamente con un enlace, tu compra no se ha realizado.');
        return;
      }

      const orderData = JSON.parse(stored) as AuthoritativeOrderResponse;
      if (orderData.orderNumber !== orderParam) {
        setErrorStatus('El número de pedido no coincide con el registrado en tu sesión.');
        return;
      }

      setConfirmedOrder(orderData);

      // T-026, RN-017: Emitir Purchase con importe y moneda autoritativos, deduplicado por pedido
      const deduplicationKey = `meta-purchase-tracked-${orderData.orderNumber}`;
      if (!sessionStorage.getItem(deduplicationKey)) {
        trackMetaEvent('Purchase', {
          content_type: 'product',
          order_id: orderData.orderNumber,
          value: orderData.total,
          currency: orderData.currency || 'GTQ',
          num_items: orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
        });
        sessionStorage.setItem(deduplicationKey, '1');
      }
    } catch {
      setErrorStatus('Error al leer los datos de confirmación.');
    }
  }, [searchParams]);

  if (errorStatus || !confirmedOrder) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-3">Información de compra no disponible</h1>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            {errorStatus || 'No se encontró un pedido registrado recientemente en tu navegador.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/productos">
              <Button size="lg" fullWidth>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Explorar productos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-primary mb-3">¡Pedido Confirmado!</h1>
        <p className="text-gray-600 mb-8 text-base">
          Gracias por tu compra, <span className="font-semibold text-gray-800">{confirmedOrder.customer.fullName}</span>. Hemos recibido tu pedido exitosamente.
        </p>

        {/* Número de pedido autoritativo */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 mb-8 inline-block text-left w-full">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Número de orden</p>
          <p className="text-3xl font-extrabold text-primary">{confirmedOrder.orderNumber}</p>
        </div>

        <section aria-labelledby="delivery-estimate" className="mb-8 rounded-xl bg-primary px-5 py-5 text-left text-white sm:px-6">
          <div className="flex items-start gap-4">
            <Truck className="mt-0.5 h-7 w-7 shrink-0" aria-hidden="true" />
            <div>
              <p id="delivery-estimate" className="text-sm font-medium text-neutral-300">Entrega estimada</p>
              <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Tu pedido llegará en 1 a 3 días hábiles</p>
              <p className="mt-1 text-sm text-neutral-300">Te contactaremos si necesitamos confirmar tu dirección.</p>
            </div>
          </div>
        </section>

        {/* Resumen detallado con importes del servidor */}
        <div className="border border-gray-200 rounded-xl p-6 mb-8 text-left bg-white">
          <h3 className="font-bold text-gray-900 text-sm mb-4 border-b pb-2">Detalle del pedido</h3>
          <div className="space-y-3 mb-4">
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.quantity}x {item.productName}
                </span>
                <span className="font-medium text-gray-900">
                  Q {Number(item.lineTotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Q {Number(confirmedOrder.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>
                {Number(confirmedOrder.shippingCost) === 0 ? 'Gratis' : `Q ${Number(confirmedOrder.shippingCost).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-200">
              <span>Total registrado</span>
              <span>Q {Number(confirmedOrder.total).toFixed(2)} {confirmedOrder.currency}</span>
            </div>
          </div>
        </div>

        {/* Siguientes pasos */}
        <div className="text-left bg-neutral-50 border border-neutral-200/80 p-5 rounded-xl mb-8">
          <h3 className="font-semibold text-neutral-900 mb-2 text-sm">Siguientes pasos:</h3>
          <ul className="list-disc list-inside text-neutral-700 space-y-1.5 text-xs">
            <li>Prepararemos tu paquete para entrega.</li>
            <li>Te contactaremos al número <span className="font-semibold">{confirmedOrder.customer.phone}</span> si se requiere confirmar tu dirección.</li>
            <li>Recuerda tener preparado el monto exacto en efectivo (Q {Number(confirmedOrder.total).toFixed(2)}) al recibirlo.</li>
          </ul>
        </div>

        <Link href="/">
          <Button size="lg" fullWidth>
            Volver a la tienda
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutExitoPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-500">Cargando información del pedido...</div>}>
      <ExitoContent />
    </Suspense>
  );
}
