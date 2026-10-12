import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';

export const ProductCard = ({ product, horizontal = false }: { product: Product; horizontal?: boolean }) => {
  const price = Number(product.price);
  const previous = Number(product.previousPrice);
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const isOutOfStock = hasVariants
    ? product.variants?.every((v) => v.stock <= 0)
    : product.stock <= 0;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-400 hover:shadow-sm ${
        horizontal ? 'md:flex-row md:items-center' : ''
      }`}
    >
      {/* Contenedor de imagen estrictamente proporcional (4:3) y centrado */}
      <Link
        href={`/${product.slug}`}
        className={`relative block w-full shrink-0 overflow-hidden bg-neutral-50/60 p-3 sm:p-4 ${
          horizontal ? 'aspect-square md:w-2/5 md:shrink-0 md:aspect-square' : 'aspect-[4/3]'
        }`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <img
            src={product.imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
            loading="lazy"
          />
        </div>
        {(isOutOfStock || previous > price) && (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white shadow-sm">
            {isOutOfStock ? 'Agotado' : 'Oferta'}
          </span>
        )}
      </Link>

      {/* Contenedor de información con alturas de línea consistentes */}
      <div
        className={`flex flex-1 flex-col justify-between gap-3 border-t border-neutral-100 p-4 sm:p-5 ${
          horizontal ? 'md:border-t-0 md:p-6' : ''
        }`}
      >
        <div>
          {/* Categoría y etiqueta de opciones (altura fija para alineación exacta) */}
          <div className="flex h-5 items-center justify-between gap-1">
            <p className="text-xs text-neutral-500 truncate">{product.category?.name || 'General'}</p>
            {hasVariants && (
              <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                {product.variants!.length} opciones
              </span>
            )}
          </div>

          {/* Título del producto con min-height uniforme para 2 líneas */}
          <h3 className="mt-1.5 min-h-[2.5rem] sm:min-h-[2.75rem] text-sm sm:text-base font-medium leading-snug line-clamp-2">
            <Link href={`/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Precios e icono alineados al fondo */}
        <div className="flex flex-wrap items-end justify-between gap-2 pt-2 border-t border-neutral-50">
          <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
            <span className="text-lg sm:text-xl font-bold">
              Q {price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
            {previous > price && (
              <span className="text-xs text-neutral-500 line-through">
                Q {previous.toFixed(2)}
              </span>
            )}
          </div>
          <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
};
