import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/features/ProductCard';
import { fetcher } from '@/services/api';
import { Category, Product } from '@/types';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { categorySlug: string };
  searchParams: { search?: string };
}) {
  const { categorySlug } = params;
  const { search } = searchParams;

  let products: Product[] = [];
  let categories: Category[] = [];

  const queryParams = new URLSearchParams();
  if (categorySlug) queryParams.append('category', categorySlug);
  if (search) queryParams.append('search', search);

  const qs = queryParams.toString();
  const endpoint = `/products${qs ? `?${qs}` : ''}`;

  const [productsRes, categoriesRes] = await Promise.allSettled([
    fetcher<Product[]>(endpoint),
    fetcher<Category[]>('/categories')
  ]);

  let productsError: string | null = null;
  if (productsRes.status === 'fulfilled') {
    products = productsRes.value;
  } else {
    productsError = 'Ocurrió un problema de conexión temporal al cargar los productos de esta categoría.';
  }

  if (categoriesRes.status === 'fulfilled') {
    categories = categoriesRes.value;
  }

  const currentCategory = categories.find(c => c.slug === categorySlug);

  return (
    <div className="store-shell py-10 sm:py-14">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Categorías */}
        <aside className="w-full md:w-52 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:sticky md:top-40">
            <h2 className="font-bold text-lg mb-4 text-primary">Categorías</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/productos"
                  className={`block py-3 text-sm transition-colors hover:text-accent text-gray-600`}
                >
                  Todos
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className={`block py-3 text-sm transition-colors hover:text-accent ${categorySlug === c.slug ? 'font-bold text-accent' : 'text-gray-600'}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid Productos */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              {currentCategory?.name || 'Catálogo'}
            </h1>
            {!productsError && (
              <p className="text-gray-500 mt-2">{products.length} productos encontrados en esta categoría.</p>
            )}
          </div>

          {productsError ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl p-8">
              <p className="text-gray-700 font-medium mb-3">{productsError}</p>
              <Link
                href={`/categorias/${categorySlug}${qs ? `?${qs}` : ''}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-50 transition-colors"
              >
                Reintentar carga
              </Link>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">No se encontraron productos con estos filtros.</p>
              <Link href="/productos" className="text-accent hover:underline font-medium">
                Limpiar filtros
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
