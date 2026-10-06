import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';
export const ProductCard = ({ product, horizontal = false }: { product: Product; horizontal?: boolean }) => {
  const price = Number(product.price);
  const previous = Number(product.previousPrice);
  return <article className={`group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:border-neutral-400 ${horizontal ? 'md:flex-row md:items-center' : ''}`}>
    <Link href={`/${product.slug}`} className={`relative flex aspect-square items-center justify-center p-6 sm:p-8 ${horizontal ? 'md:w-2/5 md:shrink-0' : ''}`} tabIndex={-1} aria-hidden="true">
      <img src={product.imageUrl} alt="" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none" loading="lazy" />
      {(product.stock <= 0 || previous > price) && <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white">{product.stock <= 0 ? 'Agotado' : 'Oferta'}</span>}
    </Link>
    <div className={`flex flex-1 flex-col gap-2 border-t border-neutral-100 p-4 sm:p-5 ${horizontal ? 'md:border-t-0 md:p-6' : ''}`}>
      <p className="text-xs text-neutral-500">{product.category?.name}</p>
      <h3 className="text-sm sm:text-base font-medium leading-relaxed line-clamp-2"><Link href={`/${product.slug}`}>{product.name}</Link></h3>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
        <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums"><span className="text-lg sm:text-xl font-bold">Q {price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>{previous > price && <span className="text-xs text-neutral-500 line-through">Q {previous.toFixed(2)}</span>}</div>
        <ArrowUpRight className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      </div>
    </div>
  </article>;
};
