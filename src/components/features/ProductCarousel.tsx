'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  products: Product[];
}

export const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollStep = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth',
    });
  };

  if (!products.length) return null;

  return (
    <div className="relative group">
      {/* Botón scroll hacia la izquierda */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Ver productos anteriores"
          className="absolute -left-3 sm:-left-5 top-1/2 z-10 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg border border-neutral-200 transition hover:bg-neutral-50 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Contenedor del carrusel: 4 productos visibles en desktop (lg), 3 en tablet (md), 2 en sm/móvil */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Carrusel de productos destacados"
        className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar py-2 focus-visible:outline-none"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc(65%)] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Botón scroll hacia la derecha */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Ver productos siguientes"
          className="absolute -right-3 sm:-right-5 top-1/2 z-10 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg border border-neutral-200 transition hover:bg-neutral-50 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
