import Banner from '@/components/features/Banner';
import { ProductCard } from '@/components/features/ProductCard';
import { fetcher } from '@/services/api';
import { Category, Product } from '@/types';
import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';

export default async function Home() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [allProducts, allCategories] = await Promise.all([
      fetcher<Product[]>('/products'),
      fetcher<Category[]>('/categories'),
    ]);
    products = allProducts;
    categories = allCategories;
  } catch (error) {
    console.error('Error fetching data for home:', error);
  }

  const featured = products.filter(p => p.featured);

  // Agrupar productos por categoría (incluyendo subcategorías)
  const categoriesWithProducts = categories.map(cat => {
    const getAllIds = (c: Category): string[] => {
      let ids = [c.id];
      if (c.subCategories && c.subCategories.length > 0) {
        c.subCategories.forEach(sub => {
          ids = ids.concat(getAllIds(sub));
        });
      }
      return ids;
    };

    const validCategoryIds = getAllIds(cat);

    return {
      ...cat,
      products: products.filter(p => validCategoryIds.includes(p.categoryId) || (p.category?.id && validCategoryIds.includes(p.category.id)))
    };
  }).filter(cat => cat.products.length > 0);

  return (
    <div className="w-full pb-24">
      {/* Hidden landmark heading for screen readers & SEO */}
      <h1 className="sr-only">Tienda Oficial — Compra en Línea con Pago Contra Entrega</h1>

      {/* Hero Banner Slider */}
      <Banner />

      {/* Destacados del Mes (Cuadrícula Curada) */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="container mx-auto px-4 mt-12 md:mt-16">
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-gray-200">
            <div>
              <h2 id="featured-heading" className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
                Destacados
              </h2>
            </div>
            <Link
              href="/productos"
              className="text-xs md:text-sm font-semibold text-accent hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {featured.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Colecciones por Categoría */}
      {categoriesWithProducts.map(cat => (
        <section key={cat.id} aria-labelledby={`cat-heading-${cat.id}`} className="container mx-auto px-4 mt-12 md:mt-16">
          <div className="flex items-end justify-between mb-4 pb-2 border-b border-gray-200">
            <div>
              <h2 id={`cat-heading-${cat.id}`} className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                {cat.name}
              </h2>
            </div>
            <Link
              href={`/categorias/${cat.slug}`}
              className="text-xs md:text-sm font-semibold text-accent hover:underline flex items-center gap-1"
            >
              Ver más en {cat.name} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Carrusel táctil snap-scroll para categorías con tarjetas compactas */}
          <div className="flex overflow-x-auto gap-3 md:gap-4 pb-3 snap-x pt-1 hide-scrollbar">
            {cat.products.map((product) => (
              <div key={product.id} className="snap-start shrink-0 w-[180px] sm:w-[200px] md:w-[220px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Estado vacío cuando no hay catálogo activo */}
      {products.length === 0 && (
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <LayoutGrid className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">Catálogo en preparación</h2>
            <p className="text-sm text-gray-500 mb-6">
              Estamos preparando nuevos productos para ti. Vuelve pronto para descubrir nuestras novedades.
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Explorar tienda
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
