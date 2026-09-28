'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronRight, LayoutGrid } from 'lucide-react';
import { Category } from '@/types';
import SearchBar from '../features/SearchBar';

interface MobileNavProps {
  categories: Category[];
  quickLinks?: Array<{ text: string; url: string }>;
  storeName?: string;
}

export default function MobileNav({ categories, quickLinks = [], storeName = 'E-COMMERCE' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsSearchOpen(false);
      }
    };
    if (isOpen || isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSearchOpen]);

  const toggleCategory = (catId: string) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  return (
    <div className="flex md:hidden items-center gap-1">
      {/* Search Toggle Button */}
      <button
        type="button"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-gray-700 hover:text-accent rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={isSearchOpen ? 'Cerrar buscador' : 'Abrir buscador'}
        aria-expanded={isSearchOpen}
      >
        <Search className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Hamburger Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-gray-700 hover:text-accent rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Mobile Search Overlay Bar */}
      {isSearchOpen && (
        <div className="fixed inset-x-0 top-16 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <SearchBar />
        </div>
      )}

      {/* Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal de navegación"
      >
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold tracking-tight text-primary"
          >
            {storeName}
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Search */}
        <div className="p-4 border-b border-gray-100">
          <SearchBar />
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-gray-100">
          {/* Main Links */}
          <div className="py-2 space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-md"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-md"
            >
              Todos los productos
            </Link>
          </div>

          {/* Categories Section */}
          <div className="py-3">
            <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Categorías</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {categories.map((cat) => {
                const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                const isExpanded = expandedCat === cat.id;

                return (
                  <div key={cat.id} className="rounded-md">
                    <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      <Link
                        href={`/categorias/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex-1 font-medium hover:text-accent"
                      >
                        {cat.name}
                      </Link>
                      {hasSubs && (
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className="p-1 text-gray-400 hover:text-gray-700"
                          aria-label={isExpanded ? `Colapsar ${cat.name}` : `Expandir ${cat.name}`}
                          aria-expanded={isExpanded}
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasSubs && isExpanded && (
                      <div className="pl-5 pr-2 py-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        {cat.subCategories!.map((sub) => {
                          const hasSubChildren = Boolean(sub.subCategories && sub.subCategories.length > 0);
                          return (
                            <div key={sub.id} className="space-y-0.5">
                              <Link
                                href={`/categorias/${sub.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-2.5 py-2 text-sm text-gray-600 hover:text-accent rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <span>{sub.name}</span>
                              </Link>
                              {hasSubChildren && (
                                <div className="pl-4 space-y-0.5 py-0.5">
                                  {sub.subCategories!.map((child) => (
                                    <Link
                                      key={child.id}
                                      href={`/categorias/${child.slug}`}
                                      onClick={() => setIsOpen(false)}
                                      className="block px-2.5 py-1.5 text-xs text-gray-500 hover:text-accent rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links Section */}
          {quickLinks.length > 0 && (
            <div className="py-3">
              <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                Enlaces Rápidos
              </div>
              <div className="mt-1 space-y-0.5">
                {quickLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
