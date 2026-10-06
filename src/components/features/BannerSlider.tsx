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
  const [isPaused, setIsPaused] = useState(false);
  const hasMultiple = banners.length > 1;
  const changeSlide = (direction: number) => {
    setCurrentIndex(current => (current + direction + banners.length) % banners.length);
  };

  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const interval = window.setInterval(() => {
      setCurrentIndex(current => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [banners.length, hasMultiple, isPaused]);

  if (!banners.length) return null;

  const index = currentIndex % banners.length;
  const banner = banners[index];
  const previews = banners.map((item, itemIndex) => ({ ...item, itemIndex }))
    .filter(item => item.itemIndex !== index).slice(0, 2);
  const campaignLabel = banner.text || `Campaña ${index + 1}`;
  const campaignContent = <img src={banner.imageUrl} alt={campaignLabel} className="h-full w-full object-cover" fetchPriority={index === 0 ? 'high' : 'auto'} />;

  return <section aria-label="Campañas y categorías destacadas" className="space-y-3"
    onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
    onFocusCapture={() => setIsPaused(true)} onBlurCapture={() => setIsPaused(false)}>
    <div className="relative overflow-hidden rounded-2xl bg-white" onKeyDown={event => {
      if (!hasMultiple) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        changeSlide(event.key === 'ArrowLeft' ? -1 : 1);
      }
    }}>
      <div role="group" aria-roledescription={hasMultiple ? 'diapositiva' : undefined} aria-label={`${index + 1} de ${banners.length}`} className="aspect-[4/3] sm:aspect-[21/9] lg:aspect-[4/1] bg-neutral-100">
        {banner.linkUrl ? <Link href={banner.linkUrl} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={campaignLabel}>{campaignContent}</Link> : campaignContent}
      </div>
      {hasMultiple && <>
        <button type="button" onClick={() => changeSlide(-1)} aria-label="Campaña anterior" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md hover:bg-neutral-100"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>
        <button type="button" onClick={() => changeSlide(1)} aria-label="Campaña siguiente" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md hover:bg-neutral-100"><ArrowRight className="h-5 w-5" aria-hidden="true" /></button>
      </>}
    </div>
    {hasMultiple && <div className="flex items-center justify-center gap-1" role="group" aria-label="Elegir campaña">
      {banners.map((_, slideIndex) => <button key={slideIndex} type="button" onClick={() => setCurrentIndex(slideIndex)} aria-label={`Ir a campaña ${slideIndex + 1} de ${banners.length}`} aria-current={slideIndex === index ? 'true' : undefined} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100"><span aria-hidden="true" className={`h-2 rounded-full ${slideIndex === index ? 'w-6 bg-primary' : 'w-2 bg-neutral-400'}`} /></button>)}
    </div>}
    {previews.length > 0 && <div className="grid gap-3 sm:grid-cols-2">
      {previews.map(item => {
        const preview = <img src={item.imageUrl} alt={item.text || `Campaña ${item.itemIndex + 1}`} className="h-full w-full object-cover" loading="lazy" />;
        const cardClass = 'relative block min-h-[110px] overflow-hidden rounded-xl bg-neutral-100 aspect-[3/1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
        return item.linkUrl ? <Link key={item.itemIndex} href={item.linkUrl} className={cardClass} aria-label={item.text || `Campaña ${item.itemIndex + 1}`}>{preview}</Link> : <button key={item.itemIndex} type="button" onClick={() => setCurrentIndex(item.itemIndex)} className={cardClass} aria-label={`Ver ${item.text || `campaña ${item.itemIndex + 1}`}`}>{preview}</button>;
      })}
    </div>}
    <span className="sr-only" aria-live="polite" aria-atomic="true">Campaña {index + 1} de {banners.length}: {campaignLabel}</span>
  </section>;
}
