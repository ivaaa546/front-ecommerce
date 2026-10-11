'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { ProductGallery } from './ProductGallery';
import { AddToCartButton } from './AddToCartButton';
import ShareProductButton from './ShareProductButton';
import { Truck, ShieldCheck, AlertCircle } from 'lucide-react';

export function ProductClientView({ product }: { product: Product }) {
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [showVariantWarning, setShowVariantWarning] = useState(false);

  const selectedVariant: ProductVariant | null = hasVariants
    ? product.variants?.find((v) => v.id === selectedVariantId) ?? null
    : null;

  const price = selectedVariant
    ? (typeof selectedVariant.price === 'string' ? parseFloat(selectedVariant.price) : Number(selectedVariant.price))
    : parseFloat(product.price);

  const previousPrice = product.previousPrice ? parseFloat(product.previousPrice) : null;
  const isDiscounted = previousPrice !== null && previousPrice > price;

  const images = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : (product.images?.length > 0 ? product.images : [product.imageUrl]);

  const activeSku = selectedVariant ? selectedVariant.sku : product.sku;

  const isTotalOutOfStock = hasVariants
    ? product.variants?.every((v) => v.stock <= 0)
    : product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-8">
        {/* Imagen de Producto */}
        <div className="md:col-span-6 lg:col-span-6 bg-white relative border-b md:border-b-0 md:border-r border-gray-100 p-6 sm:p-10">
          <div className="md:sticky md:top-40">
            <ProductGallery
              key={selectedVariantId ?? 'base'}
              images={images}
              productName={selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}
            />
          </div>
          {isTotalOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm uppercase tracking-wider shadow-lg">
                Agotado temporalmente
              </span>
            </div>
          )}
        </div>

        {/* Detalles de Producto */}
        <div className="md:col-span-6 lg:col-span-6 p-4 sm:p-6 md:p-10 flex flex-col justify-between">
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
                <span className="text-xs font-bold text-neutral-800 bg-neutral-100/80 px-2 py-0.5 rounded-full">
                  Ahorras Q {(previousPrice - price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 md:mb-5 leading-relaxed">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            {/* Selector de Variantes (T-010, RF-004, RF-006) */}
            {hasVariants && product.variants && product.variants.length > 0 && (
              <div className="my-4 py-3 border-y border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Variante:
                  </label>
                  {selectedVariant && (
                    <span className="text-xs text-gray-600 font-medium">
                      {selectedVariant.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    const isOutOfStock = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setShowVariantWarning(false);
                        }}
                        disabled={isOutOfStock}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-black bg-black text-white shadow-xs'
                            : isOutOfStock
                            ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-800 hover:border-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span>{v.name}</span>
                        {isOutOfStock && <span className="text-[10px] font-normal no-underline">(Agotado)</span>}
                      </button>
                    );
                  })}
                </div>

                {showVariantWarning && !selectedVariant && (
                  <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Por favor selecciona una variante para poder comprar.
                  </p>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 mb-3 md:mb-5 flex items-center gap-4 pt-1">
              <p>SKU: <span className="font-mono text-gray-700">{activeSku}</span></p>
            </div>
          </div>

          {/* Acciones de compra y Garantías */}
          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-100">
            <AddToCartButton
              product={product}
              selectedVariant={selectedVariant}
              onRequireVariant={() => setShowVariantWarning(true)}
            />

            <div className="flex items-center justify-between pt-1">
              <ShareProductButton
                productName={product.name}
                productSlug={product.slug}
                price={price.toFixed(2)}
                variant="detail"
              />
            </div>

            {/* Badges de Confianza */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-neutral-600 flex-shrink-0" aria-hidden="true" />
                <span><strong>Envíos nacionales:</strong> Despachos a toda Guatemala.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-neutral-600 flex-shrink-0" aria-hidden="true" />
                <span><strong>Garantía de calidad:</strong> Inspeccionado antes del empaque.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
