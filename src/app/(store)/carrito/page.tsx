'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
          <div className="w-full lg:w-80 h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">Parece que aún no has agregado productos a tu carrito.</p>
        <Link href="/productos">
          <Button size="lg">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="flex items-baseline gap-2 pb-3 mb-8 border-b border-gray-900">
        <h1 className="text-2xl md:text-3xl font-extrabold text-black">Carrito</h1>
        <span className="text-lg text-gray-700 font-normal">
          ({items.reduce((acc, i) => acc + i.quantity, 0)} {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'ítem' : 'ítems'})
        </span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Lista de productos */}
        <div className="flex-1 w-full space-y-4 divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.productId} className="pt-4 first:pt-0 flex gap-4 items-start">
              {/* Imagen del Producto */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 bg-white border border-gray-200 rounded-md p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-28">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link 
                      href={`/${item.slug || item.productId}`} 
                      className="font-bold text-sm sm:text-base text-black hover:text-accent line-clamp-2 leading-tight"
                    >
                      {item.name}
                    </Link>
                    <button 
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-1 text-gray-700 hover:text-red-600 transition-colors shrink-0"
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  
                  {item.stock <= 5 && (
                    <p className="text-xs text-orange-600 font-medium mt-0.5">
                      Solo {item.stock} disponibles
                    </p>
                  )}
                </div>

                {/* Control de Cantidad y Precio */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <div className="border border-gray-900 rounded-xs flex items-center h-8 bg-white">
                    <button 
                      type="button"
                      className="px-2.5 h-full flex items-center justify-center text-gray-800 hover:bg-gray-100 disabled:opacity-30 text-xs font-semibold"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Disminuir"
                    >
                      —
                    </button>
                    <span className="px-2 text-xs sm:text-sm font-bold text-black min-w-[1.75rem] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      type="button"
                      className="px-2.5 h-full flex items-center justify-center text-gray-800 hover:bg-gray-100 disabled:opacity-30 text-sm font-semibold"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-base sm:text-lg font-bold text-black tracking-tight">
                    Q {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-xs">
            <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-gray-900">
              <span className="text-lg font-bold text-black">Total estimado</span>
              <span className="text-2xl font-black text-black">Q {getTotal().toFixed(2)}</span>
            </div>

            <p className="text-xs text-gray-500 mb-6 italic">
              El costo de envío se calculará en el siguiente paso de pago.
            </p>

            <div className="space-y-3 mb-4">
              <Link href="/checkout" className="block">
                <button
                  type="button"
                  className="w-full bg-white hover:bg-gray-50 text-black border-2 border-black rounded-full py-3.5 font-bold text-sm sm:text-base text-center transition-all shadow-xs cursor-pointer"
                >
                  Finalizar compra
                </button>
              </Link>
              <Link href="/productos" className="block">
                <button
                  type="button"
                  className="w-full bg-black hover:bg-zinc-800 text-white rounded-full py-3.5 font-bold text-sm sm:text-base text-center transition-all shadow-xs cursor-pointer"
                >
                  Seguir comprando
                </button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-700 font-medium pt-2 border-t border-gray-100">
              <span>🔒 Pago seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
