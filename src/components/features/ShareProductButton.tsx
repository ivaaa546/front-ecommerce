'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareProductButtonProps {
  productName: string;
  productSlug: string;
  price?: string;
  variant?: 'detail' | 'admin' | 'compact';
}

export default function ShareProductButton({
  productName,
  productSlug,
  price,
  variant = 'detail',
}: ShareProductButtonProps) {
  const [copied, setCopied] = useState(false);

  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${productSlug}`;
    }
    return `/${productSlug}`;
  };

  const handleCopyLink = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const url = getProductUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleNativeShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const url = getProductUrl();
    const shareData = {
      title: productName,
      text: price
        ? `Mira ${productName} por Q ${parseFloat(price).toFixed(2)}`
        : productName,
      url: url,
    };

    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
        return;
      }
    }
    // Fallback: copiar al portapapeles
    handleCopyLink();
  };

  // Versión compacta para la tabla de administración
  if (variant === 'admin') {
    return (
      <button
        type="button"
        onClick={handleCopyLink}
        title="Copiar enlace directo para anuncios"
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all border ${copied
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-primary shadow-2xs'
          }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>¡Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            <span>Link para anuncio</span>
          </>
        )}
      </button>
    );
  }

  // Versión para la página pública de detalle del producto
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-primary transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
        title="Compartir o copiar enlace del producto"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-150" />
            <span className="text-emerald-700 font-semibold">¡Enlace copiado!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-gray-500" />
            <span>Compartir producto</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleCopyLink}
        title="Copiar enlace directo al portapapeles"
        className="p-2 text-gray-500 hover:text-primary rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
        aria-label="Copiar enlace"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
