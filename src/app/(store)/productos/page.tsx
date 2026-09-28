import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/features/ProductCard';
import { fetcher } from '@/services/api';
import { Category, Product } from '@/types';

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const { category, search } = searchParams;
  
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);

    const qs = queryParams.toString();
    const endpoint = `/products${qs ? `?${qs}` : ''}`;
    
    [products, categories] = await Promise.all([
      fetcher<Product[]>(endpoint),
      fetcher<Category[]>('/categories')
    ]);
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Categorías */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4 text-primary">Categorías</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/productos" 
                  className={`block py-1 text-sm transition-colors hover:text-accent ${!category ? 'font-bold text-accent' : 'text-gray-600'}`}
                >
                  Todos
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link 
                    href={`/categorias/${c.slug}`}
                    className={`block py-1 text-sm transition-colors hover:text-accent ${category === c.slug ? 'font-bold text-accent' : 'text-gray-600'}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid Productos */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary">
              {category 
                ? categories.find(c => c.slug === category)?.name || 'Catálogo'
                : 'Todos los Productos'}
            </h1>
            <p className="text-gray-500 mt-2">{products.length} productos encontrados.</p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
