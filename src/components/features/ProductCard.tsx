import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';

export const ProductCard = ({ product }: { product: Product }) => {
  const price = parseFloat(product.price);
  const prevPrice = product.previousPrice ? parseFloat(product.previousPrice) : null;
  const isDiscounted = prevPrice !== null && prevPrice > price;

  return (
    <article className="overflow-hidden group flex flex-col h-full bg-white border border-gray-200/90 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <Link 
        href={`/${product.slug}`} 
        className="block relative h-40 sm:h-44 md:h-48 w-full overflow-hidden bg-white focus:outline-none flex items-center justify-center p-4"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img 
          src={product.imageUrl} 
          alt="" 
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.stock <= 0 ? (
            <span className="bg-primary/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
              Agotado
            </span>
          ) : isDiscounted ? (
            <span className="bg-amber-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wide">
              Oferta
            </span>
          ) : null}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        {product.category?.name && (
          <span className="text-xs font-medium text-gray-500 mb-1">{product.category.name}</span>
        )}
        <h3 className="font-semibold text-base text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          <Link href={`/${product.slug}`} className="focus:outline-none focus-visible:underline">
            {product.name}
          </Link>
        </h3>
        
        <div className="mt-auto pt-3 flex items-baseline justify-between gap-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">Q {price.toFixed(2)}</span>
            {isDiscounted && (
              <span className="text-xs text-gray-500 line-through">
                Q {prevPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Link 
            href={`/${product.slug}`}
            className="text-xs font-semibold text-accent hover:underline flex items-center"
            tabIndex={-1}
            aria-hidden="true"
          >
            Ver más &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
};
