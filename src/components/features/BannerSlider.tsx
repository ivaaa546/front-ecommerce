'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BannerItem {
  imageUrl: string;
  text?: string | null;
  linkUrl?: string | null;
}

export default function BannerSlider({ banners }: { banners: BannerItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  if (!banners || banners.length === 0) return null;

  return (
    <section 
      aria-label="Promociones y novedades"
      className="relative w-full h-72 md:h-96 lg:h-[480px] bg-primary overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {banners.map((banner, index) => {
        const isActive = index === currentIndex;
        const content = (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            aria-hidden={!isActive}
          >
            <img 
              src={banner.imageUrl} 
              alt={banner.text || `Banner ${index + 1}`} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {banner.text && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />}
            
            {banner.text && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md max-w-3xl leading-tight">
                  {banner.text}
                </h2>
                {banner.linkUrl && (
                  <span className="mt-6 inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-sm md:text-base">
                    Explorar colección &rarr;
                  </span>
                )}
              </div>
            )}
          </div>
        );

        if (banner.linkUrl && isActive) {
          return (
            <Link key={index} href={banner.linkUrl} className="block w-full h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-accent">
              {content}
            </Link>
          );
        }

        return content;
      })}

      {/* Controles de paginación accesibles */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-1">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
              aria-label={`Ir al banner ${idx + 1} de ${banners.length}`}
              aria-current={idx === currentIndex ? 'true' : 'false'}
            >
              <span className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/80'
              }`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
