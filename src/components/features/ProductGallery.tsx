'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full aspect-square md:aspect-auto md:h-[400px] mb-4">
        <img 
          src={images[currentIndex]} 
          alt={`${productName} - vista ${currentIndex + 1}`} 
          className="w-full h-full max-h-[350px] object-contain hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 md:gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === idx ? 'border-primary shadow-md' : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
