'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const openCart = useCartStore((state) => state.openCart);
  const count = useCartStore((state) => 
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  // Evita hydration mismatch en el primer render
  useEffect(() => {
    setMounted(true);
  }, []);

  const displayCount = mounted ? count : 0;

    return (
      <button
        type="button"
        onClick={openCart}
        className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary hover:text-accent transition-colors rounded-full hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        aria-label={`Carrito de compras, ${displayCount} ${displayCount === 1 ? 'producto' : 'productos'}`}
      >
        <ShoppingCart className="w-6 h-6" aria-hidden="true" />
        {displayCount > 0 && (
        <span 
          className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full min-w-[1.25rem] h-5"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  );
}
