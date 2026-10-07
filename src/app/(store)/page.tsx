import Banner from '@/components/features/Banner';
import { ProductCard } from '@/components/features/ProductCard';
import { fetcher } from '@/services/api';
import { Category, Product } from '@/types';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export default async function Home() {
  let products: Product[] = [], categories: Category[] = [];
  let failed = false;
  try { [products, categories] = await Promise.all([fetcher<Product[]>('/products'), fetcher<Category[]>('/categories')]); } catch { failed = true; }
  const featured = products.filter(p => p.featured);
  const selected = featured.length ? featured : products;
  const allIds = (c: Category): string[] => [c.id, ...(c.subCategories || []).flatMap(allIds)];
  return <div className="pb-20">
    <h1 className="sr-only">Explora nuestros productos y categorías</h1>
    <div className="store-shell pt-5 sm:pt-8"><Banner /></div>
    <section className="store-shell mt-7 sm:mt-14" aria-labelledby="catalog-heading">
      <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="catalog-heading" className="section-heading">Descubre el catálogo</h2><Link href="/productos" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium">Ver todo <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <nav aria-label="Explorar categorías" className="my-6 flex flex-wrap gap-2"><Link href="/productos" className="flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm text-white">Todos los productos</Link>{categories.map(c => <Link key={c.id} href={`/categorias/${c.slug}`} className="flex min-h-11 items-center rounded-lg border border-neutral-200 bg-white px-4 text-sm hover:border-neutral-500">{c.name}</Link>)}</nav>
      {products.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5">{selected.slice(0,8).map(p => <ProductCard key={p.id} product={p} horizontal />)}</div> : <div className="rounded-xl border border-neutral-200 py-16 text-center"><h3 className="text-xl font-semibold">{failed ? 'No pudimos cargar el catálogo' : 'Catálogo en preparación'}</h3><p className="mt-3 text-neutral-600">{failed ? 'Intenta recargar la página en unos momentos.' : 'Vuelve pronto para descubrir nuestros productos.'}</p></div>}
    </section>
    {categories.map(c => { const ids = allIds(c); const items = products.filter(p => ids.includes(p.categoryId)); if (!items.length) return null; return <section key={c.id} className="store-shell mt-12 sm:mt-16" aria-labelledby={`category-${c.id}`}><div className="mb-6 flex items-center justify-between gap-4"><h2 id={`category-${c.id}`} className="section-heading">{c.name}</h2><Link href={`/categorias/${c.slug}`} className="flex min-h-11 items-center gap-2 text-sm font-medium">Ver categoría <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">{items.slice(0,4).map(p => <ProductCard key={p.id} product={p} />)}</div></section>; })}
  </div>;
}
