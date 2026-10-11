import React from 'react';
import { fetcher, ApiError } from '@/services/api';
import { Product } from '@/types';
import { notFound } from 'next/navigation';
import { ProductClientView } from '@/components/features/ProductClientView';
import Link from 'next/link';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ViewContentTracker from '@/components/analytics/ViewContentTracker';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: Product | null = null;
  let loadError: string | null = null;

  try {
    product = await fetcher<Product>(`/products/${params.slug}`);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    loadError = 'Ocurrió un problema temporal al cargar este producto. Por favor reintenta.';
  }

  if (loadError) {
    return (
      <div className="store-shell py-16 text-center">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No pudimos cargar este producto</h2>
          <p className="text-gray-600 text-sm mb-6">{loadError}</p>
          <div className="flex gap-4 justify-center">
            <Link href={`/${params.slug}`}>
              <Button>Reintentar</Button>
            </Link>
            <Link href="/productos">
              <Button variant="outline">Ver catálogo</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const price = parseFloat(product.price);

  return (
    <div className="store-shell py-6 sm:py-10">
      <ViewContentTracker productId={product.id} name={product.name} price={price} />
      {/* Breadcrumb Navigation */}
      <nav aria-label="Ruta de navegación" className="mb-3 md:mb-6 flex items-center gap-1.5 text-xs md:text-sm text-gray-500">
        <Link href="/" className="hover:text-primary transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        <Link href="/productos" className="hover:text-primary transition-colors">
          Catálogo
        </Link>
        {product.category?.name && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <Link
              href={`/categorias/${product.category.slug || ''}`}
              className="hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        <span className="text-gray-900 font-medium truncate max-w-[160px] md:max-w-none" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* Main Product Card */}
      <ProductClientView product={product} />
    </div>
  );
}
