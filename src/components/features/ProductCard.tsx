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

  return <article className={`group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:border-neutral-400 ${horizontal ? 'md:flex-row md:items-center' : ''}`}>
    <Link href={`/${product.slug}`} className={`relative flex aspect-square items-center justify-center p-6 sm:p-8 ${horizontal ? 'md:w-2/5 md:shrink-0' : ''}`} tabIndex={-1} aria-hidden="true">
      <img src={product.imageUrl} alt="" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none" loading="lazy" />
      {(isOutOfStock || previous > price) && <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white">{isOutOfStock ? 'Agotado' : 'Oferta'}</span>}
    </Link>
    <div className={`flex flex-1 flex-col gap-2 border-t border-neutral-100 p-4 sm:p-5 ${horizontal ? 'md:border-t-0 md:p-6' : ''}`}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs text-neutral-500">{product.category?.name}</p>
        {hasVariants && (
          <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
            {product.variants!.length} opciones
          </span>
        )}
      </div>
      <h3 className="text-sm sm:text-base font-medium leading-relaxed line-clamp-2"><Link href={`/${product.slug}`}>{product.name}</Link></h3>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
        <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums"><span className="text-lg sm:text-xl font-bold">Q {price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>{previous > price && <span className="text-xs text-neutral-500 line-through">Q {previous.toFixed(2)}</span>}</div>
        <ArrowUpRight className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      </div>
    </div>
  </article>;
};
