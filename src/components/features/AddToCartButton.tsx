'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types';
import { ShoppingCart, Check } from 'lucide-react';

export const AddToCartButton = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const setItem = useCartStore((state) => state.setItem);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const handleAdd = () => {
    if (product.stock <= 0) return;
    
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock,
      quantity,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    
    setItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock,
      quantity,
    });
    
    router.push('/checkout');
  };

  if (product.stock <= 0) {
    return (
      <Button variant="danger" fullWidth disabled>
        Agotado temporalmente
      </Button>
    );
  }

  return (
    <div className="flex flex-col space-y-2.5">
      {/* Selector de Cantidad compacto */}
      <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium text-xs sm:text-sm">Cantidad:</span>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
            <button 
              type="button"
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors font-medium text-base"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className="px-3 py-0.5 border-x border-gray-200 min-w-[2.2rem] text-center font-semibold text-xs sm:text-sm">{quantity}</span>
            <button 
              type="button"
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors font-medium text-base"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>
        {product.stock <= 5 ? (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200/50 shadow-sm">
            ¡Últimas {product.stock} disponibles!
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            En existencia
          </span>
        )}
      </div>
      
      {/* Botones de Compra: Lado a lado en móvil y escritorio para no empujar la vista */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
        {/* Botón 1: Comprar Ahora */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleBuyNow}
                  className="bg-primary hover:bg-black text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base px-2"
                >
                  <span className="truncate">Comprar ahora</span>
                </Button>

        {/* Botón 2: Agregar al carrito */}
        <Button 
          type="button"
          variant="outline" 
          size="lg" 
          fullWidth 
          onClick={handleAdd}
          className={`border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 sm:py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base px-2 ${
            added ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : ''
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 animate-in zoom-in duration-150 flex-shrink-0" />
              <span className="truncate">¡Agregado!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <span className="truncate">Agregar al carrito</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
