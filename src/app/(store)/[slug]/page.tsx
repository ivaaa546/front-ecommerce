import React from 'react';
import { fetcher } from '@/services/api';
import { Product } from '@/types';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/features/AddToCartButton';
import ShareProductButton from '@/components/features/ShareProductButton';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Truck } from 'lucide-react';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: Product | null = null;

  try {
    product = await fetcher<Product>(`/products/${params.slug}`);
  } catch (error) {
    console.error('Error fetching product details:', error);
  }

  if (!product) {
    notFound();
  }

  const price = parseFloat(product.price);
  const previousPrice = product.previousPrice ? parseFloat(product.previousPrice) : null;
  const isDiscounted = previousPrice !== null && previousPrice > price;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
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
      <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Imagen de Producto - Contenedor compacto */}
          <div className="md:col-span-5 lg:col-span-4 bg-gray-50 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-200/80 p-3 sm:p-6">
            <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] aspect-square flex items-center justify-center">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm uppercase tracking-wider shadow-lg">
                  Agotado temporalmente
                </span>
              </div>
            )}
          </div>

          {/* Detalles de Producto */}
          <div className="md:col-span-7 lg:col-span-8 p-4 sm:p-6 md:p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-primary mb-2 md:mb-4 leading-tight tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-2.5 sm:gap-3 mb-3 md:mb-5">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">
                  Q {price.toFixed(2)}
                </span>
                {isDiscounted && (
                  <span className="text-sm sm:text-base md:text-lg text-gray-400 line-through">
                    Q {previousPrice.toFixed(2)}
                  </span>
                )}
                {isDiscounted && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    Ahorras Q {(previousPrice - price).toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 md:mb-5 leading-relaxed">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
              
              <div className="text-xs text-gray-500 mb-3 md:mb-5 flex items-center gap-4 border-t border-gray-100 pt-2 md:pt-3">
                <p>SKU: <span className="font-mono text-gray-700">{product.sku}</span></p>
                {product.stock > 0 && (
                  <p className="text-emerald-700 font-medium">● En existencia</p>
                )}
              </div>
            </div>
            
            {/* Acciones de compra y Garantías */}
            <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-100">
              <AddToCartButton product={product} />

              <div className="flex items-center justify-between pt-1">
                <ShareProductButton
                  productName={product.name}
                  productSlug={product.slug}
                  price={product.price}
                  variant="detail"
                />
              </div>

              {/* Badges de Confianza */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <span><strong>Envíos nacionales:</strong> Despachos a toda Guatemala.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <span><strong>Garantía de calidad:</strong> Inspeccionado antes del empaque.</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
