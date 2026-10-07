'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BannerItem {
  imageUrl: string;
  text?: string | null;
  linkUrl?: string | null;
}

export default function BannerSlider({ banners }: { banners: BannerItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const hasMultiple = banners.length > 1;
  const changeSlide = (direction: number) => {
    setCurrentIndex(current => (current + direction + banners.length) % banners.length);
  };

  useEffect(() => {
    if (!hasMultiple) return;
    const interval = window.setInterval(() => {
      setCurrentIndex(current => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [banners.length, hasMultiple]);

  if (!banners.length) return null;

  const index = currentIndex % banners.length;
  const banner = banners[index];
  const previews = banners.map((item, itemIndex) => ({ ...item, itemIndex }))
    .filter(item => item.itemIndex !== index).slice(0, 2);
  const campaignLabel = banner.text || `Campaña ${index + 1}`;
  const campaignContent = <img src={banner.imageUrl} alt={campaignLabel} className="block h-full w-full object-cover" fetchPriority={index === 0 ? 'high' : 'auto'} />;

  return <section aria-label="Campañas y categorías destacadas" className="space-y-3 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:items-stretch lg:gap-3 lg:space-y-0">
    <div className="relative overflow-hidden rounded-2xl bg-white lg:h-full"
      onTouchStart={e => {
        if (!hasMultiple) return;
        setTouchStartX(e.touches[0].clientX);
      }}
      onTouchEnd={e => {
        if (!hasMultiple || touchStartX === null) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          changeSlide(diff > 0 ? 1 : -1);
        }
        setTouchStartX(null);
      }}
      onKeyDown={event => {
        if (!hasMultiple) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          changeSlide(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      <div role="group" aria-roledescription={hasMultiple ? 'diapositiva' : undefined} aria-label={`${index + 1} de ${banners.length}`} className="aspect-[8/3] sm:aspect-[3/1] lg:h-full bg-neutral-100">
        {banner.linkUrl ? <Link href={banner.linkUrl} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={campaignLabel}>{campaignContent}</Link> : campaignContent}
      </div>
      {hasMultiple && <>
        <button type="button" onClick={event => { event.preventDefault(); event.stopPropagation(); changeSlide(-1); }} aria-label="Campaña anterior" className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md hover:bg-neutral-100 sm:flex"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>
        <button type="button" onClick={event => { event.preventDefault(); event.stopPropagation(); changeSlide(1); }} aria-label="Campaña siguiente" className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md hover:bg-neutral-100 sm:flex"><ArrowRight className="h-5 w-5" aria-hidden="true" /></button>
      </>}
    </div>
    {previews.length > 0 && <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-1">
      {previews.map(item => {
        const preview = <img src={item.imageUrl} alt={item.text || `Campaña ${item.itemIndex + 1}`} className="h-full w-full object-cover" loading="lazy" />;
        const cardClass = 'relative block min-h-[110px] overflow-hidden rounded-xl bg-neutral-100 aspect-[3/1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
        return item.linkUrl ? <Link key={item.itemIndex} href={item.linkUrl} className={cardClass} aria-label={item.text || `Campaña ${item.itemIndex + 1}`}>{preview}</Link> : <button key={item.itemIndex} type="button" onClick={() => setCurrentIndex(item.itemIndex)} className={cardClass} aria-label={`Ver ${item.text || `campaña ${item.itemIndex + 1}`}`}>{preview}</button>;
      })}
    </div>}
    <span className="sr-only" aria-live="polite" aria-atomic="true">Campaña {index + 1} de {banners.length}: {campaignLabel}</span>
  </section>;
}
