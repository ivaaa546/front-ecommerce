import React from 'react';
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
    return null;
  }

  // Usamos el array nuevo 'banners', o caemos al banner legacy si existe
  let bannersToPass = [];
  if (settings?.banners && settings.banners.length > 0) {
    bannersToPass = settings.banners;
  } else if (settings?.banner?.imageUrl) {
    bannersToPass = [settings.banner as any];
  }

  if (bannersToPass.length === 0) {
    return null;
  }

  return <BannerSlider banners={bannersToPass} />;
}
