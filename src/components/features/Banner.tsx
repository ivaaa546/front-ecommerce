import React from 'react';
import Link from 'next/link';
import { fetcher } from '@/services/api';
import BannerSlider from './BannerSlider';

interface Settings {
  banner: {
    imageUrl: string | null;
    text: string | null;
    linkUrl: string | null;
  };
  banners?: {
    imageUrl: string;
    text: string | null;
    linkUrl: string | null;
  }[];
}

export default async function Banner() {
  let settings: Settings | null = null;

  try {
    settings = await fetcher<Settings>('/settings');
  } catch (error) {
    console.error('Error fetching banner settings:', error);

  }

  // Usamos el array nuevo 'banners', o caemos al banner legacy si existe
  let bannersToPass: NonNullable<Settings['banners']> = [];
  if (settings?.banners && settings.banners.length > 0) {
    bannersToPass = settings.banners;
  } else if (settings?.banner?.imageUrl) {
    bannersToPass = [{ ...settings.banner, imageUrl: settings.banner.imageUrl }];
  }

  if (bannersToPass.length === 0) {
    return <section className="rounded-2xl bg-neutral-100 px-6 py-10 sm:p-12" aria-label="Explora la tienda">
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-balance">Encuentra lo que buscas.</h2>
      <p className="mt-4 text-neutral-600">Descubre nuestros productos y explora todas las categorías.</p>
      <Link href="/productos" className="action-link mt-6">Explorar catálogo</Link>
    </section>;
  }

  return <BannerSlider banners={bannersToPass} />;
}
