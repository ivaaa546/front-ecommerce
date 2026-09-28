'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const total = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  );
  const count = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear scroll del fondo cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar al pulsar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const handleGoToCart = () => {
    closeCart();
    router.push('/carrito');
  };

  return (
    <>
      {/* Backdrop oscuro con fade */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Panel lateral deslizante (Drawer) */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[390px] sm:max-w-[420px] bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Cabecera del Carrito */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-900">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
                Carrito
              </h2>
              <span className="text-base sm:text-lg font-normal text-gray-800">
                ({count} {count === 1 ? 'ítem' : 'ítems'})
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-gray-800 hover:text-black hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              aria-label="Cerrar carrito"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Cuerpo / Lista de Productos */}
        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500 mb-6">Agrega tus productos favoritos para empezar.</p>
              <button
                type="button"
                onClick={closeCart}
                className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-zinc-800 transition-colors inline-flex items-center gap-2"
              >
                <span>Explorar catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3.5 items-start py-2 group">
                  {/* Imagen del Producto en marco nítido */}
                  <div className="w-20 h-24 sm:w-24 sm:h-28 bg-white border border-gray-200 rounded-md p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Información del Producto */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-28">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/${item.slug || item.productId}`}
                          onClick={closeCart}
                          className="font-bold text-sm text-black hover:text-accent line-clamp-2 leading-tight"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-gray-700 hover:text-red-600 transition-colors shrink-0"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.stock <= 5 && (
                        <p className="text-[11px] text-orange-600 font-medium mt-0.5">
                          Solo {item.stock} disponibles
                        </p>
                      )}
                    </div>

                    {/* Selector de Cantidad + Precio */}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      {/* Control de Cantidad con bordes negros */}
                      <div className="border border-gray-900 rounded-xs flex items-center h-8 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2.5 h-full flex items-center justify-center text-gray-800 hover:bg-gray-100 disabled:opacity-30 text-xs font-semibold"
                          aria-label="Disminuir"
                        >
                          —
                        </button>
                        <span className="px-2 text-xs sm:text-sm font-bold text-black min-w-[1.75rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2.5 h-full flex items-center justify-center text-gray-800 hover:bg-gray-100 disabled:opacity-30 text-sm font-semibold"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      {/* Precio */}
                      <span className="text-base sm:text-lg font-bold text-black tracking-tight">
                        Q {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección Inferior / Total */}
        {items.length > 0 && (
          <div className="px-5 pb-5 pt-2 bg-white border-t border-gray-100">
            {/* Total Estimado */}
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-lg sm:text-xl font-bold text-black">Total estimado</span>
              <span className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                Q {total.toFixed(2)}
              </span>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2.5 mb-3">
              {/* Botón 1: Finalizar compra (Blanco con borde negro) */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full bg-white hover:bg-gray-50 text-black border-2 border-black rounded-full py-3.5 font-bold text-sm sm:text-base text-center transition-all shadow-xs active:scale-[0.99] flex items-center justify-center cursor-pointer"
              >
                Finalizar compra
              </button>

              {/* Botón 2: Ver carrito (Negro sólido) */}
              <button
                type="button"
                onClick={handleGoToCart}
                className="w-full bg-black hover:bg-zinc-800 text-white rounded-full py-3.5 font-bold text-sm sm:text-base text-center transition-all shadow-xs active:scale-[0.99] flex items-center justify-center cursor-pointer"
              >
                Ver carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}