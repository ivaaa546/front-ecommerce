'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function CheckoutExitoPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Solo leemos el param una vez montado para evitar problemas de hydration
    setOrderNumber(searchParams.get('order'));
  }, [searchParams]);

  if (!orderNumber) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Información no disponible</h1>
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
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-primary mb-4">¡Pedido Confirmado!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Gracias por tu compra. Hemos recibido tu pedido y pronto nos comunicaremos contigo.
        </p>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 inline-block text-left w-full max-w-md">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Número de orden</p>
          <p className="text-3xl font-bold text-accent">{orderNumber}</p>
        </div>
        
        <div className="text-left bg-blue-50 border border-blue-100 p-4 rounded-md mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">Siguientes pasos:</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
            <li>Prepararemos tus productos inmediatamente.</li>
            <li>El repartidor se comunicará al número que proporcionaste.</li>
            <li>Recuerda tener el efectivo exacto o el pago listo al momento de la entrega.</li>
          </ul>
        </div>
        
        <Link href="/">
          <Button size="lg">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
