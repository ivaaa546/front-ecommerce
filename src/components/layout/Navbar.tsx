import React from 'react';
import Link from 'next/link';
import CartIcon from './CartIcon';
import SearchBar from '../features/SearchBar';
import { fetcher } from '@/services/api';
import { Category } from '@/types';
import NavbarCategories from './NavbarCategories';
import MobileNav from './MobileNav';

export default async function Navbar() {
  let categories: Category[] = [];
  let storeName = 'E-COMMERCE';
  let logoUrl: string | null = null;
  let quickLinksActive = false;
  let quickLinks: any[] = [];

  try {
    const [catsRes, settingsRes] = await Promise.all([
      fetcher<Category[]>('/categories'),
      fetcher<any>('/settings')
    ]);
    categories = catsRes;
    if (settingsRes) {
      if (settingsRes.storeName) storeName = settingsRes.storeName;
      if (settingsRes.logoUrl) logoUrl = settingsRes.logoUrl;
      if (settingsRes.quickLinksActive !== undefined) quickLinksActive = settingsRes.quickLinksActive;
      if (settingsRes.quickLinks) quickLinks = settingsRes.quickLinks;
    }
  } catch (err) {
    console.error('Error fetching data for navbar:', err);
  }

  const hasSubNav = categories.length > 0 || (quickLinksActive && quickLinks && quickLinks.length > 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-xs">
      {/* Barra Principal: Logo + Buscador Central + Acciones */}
      <div className="store-shell h-20 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0" aria-label={storeName}>
          <img
            src={`${logoUrl || '/logo.png'}?v=2`}
            alt={storeName}
            className="h-9 sm:h-10 md:h-12 w-auto max-w-[200px] md:max-w-[240px] object-contain object-left"
          />
        </Link>

        {/* Barra de Búsqueda Centrada y espaciosa (Desktop) */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <SearchBar />
        </div>

        {/* Actions (Mobile Nav Drawer + Cart) */}
        <div className="flex items-center space-x-1 md:space-x-4 flex-shrink-0">
          <Link href="/productos" className="hidden lg:inline-flex min-h-11 items-center px-3 text-sm font-medium">Catálogo</Link>
          <MobileNav categories={categories} quickLinks={quickLinksActive ? quickLinks : []} storeName={storeName} />
          <CartIcon />
        </div>
      </div>

      <div className="md:hidden px-4 pb-4">
        <SearchBar />
      </div>

      {/* Sub-navbar: Categorías y Enlaces Rápidos (Solo Desktop - Blanco) */}
      {hasSubNav && (
        <div className="hidden md:block bg-white border-b border-gray-200 relative z-40">
          <div className="store-shell h-12 flex items-center overflow-x-auto md:overflow-visible hide-scrollbar">
            <NavbarCategories
              categories={categories}
              quickLinks={quickLinks}
              quickLinksActive={quickLinksActive}
            />
          </div>
        </div>
      )}
    </header>
  );
}
