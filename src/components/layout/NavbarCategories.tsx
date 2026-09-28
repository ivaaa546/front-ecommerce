'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/types';

interface NavbarCategoriesProps {
  categories: Category[];
  quickLinks?: Array<{ text: string; url: string }>;
  quickLinksActive?: boolean;
}

export default function NavbarCategories({
  categories,
  quickLinks = [],
  quickLinksActive = false,
}: NavbarCategoriesProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Cerrar menús automáticamente al cambiar de página
  useEffect(() => {
    setOpenDropdownId(null);
    setActiveFlyout(null);
  }, [pathname]);

  // Cerrar cuando se hace clic fuera del navbar
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const isInsideNav = navRef.current?.contains(target);

      if (!isInsideNav) {
        setOpenDropdownId(null);
        setActiveFlyout(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const MAX_DIRECT = 6;
  const directCategories = categories.slice(0, MAX_DIRECT);
  const extraCategories = categories.slice(MAX_DIRECT);

  const handleCategoryClick = (catId: string, hasSubs: boolean) => {
    if (!hasSubs) {
      setOpenDropdownId(null);
      return;
    }
    // Alternar apertura
    setOpenDropdownId(prev => (prev === catId ? null : catId));
  };

  const closeAll = () => {
    setOpenDropdownId(null);
    setActiveFlyout(null);
  };

  return (
    <>
      <nav 
        ref={navRef}
        className="h-full flex items-center justify-start gap-1 md:gap-3 whitespace-nowrap flex-nowrap shrink-0" 
        aria-label="Navegación de categorías"
      >
        {/* Enlaces Rápidos destacados (Solo Desktop) */}
        {quickLinksActive && quickLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {quickLinks.map((link, idx) => (
              <Link
                key={`quick-${idx}`}
                href={link.url}
                onClick={closeAll}
                className="relative px-2.5 md:px-3 py-2 text-xs md:text-sm font-medium tracking-normal transition-colors text-gray-600 hover:text-accent group flex items-center h-full shrink-0 whitespace-nowrap"
              >
                <span>{link.text}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </div>
        )}

        {/* Separador discreto entre enlaces destacados y categorías (Solo Desktop) */}
        {quickLinksActive && quickLinks.length > 0 && directCategories.length > 0 && (
          <span className="hidden md:inline-block h-4 w-px bg-gray-200 mx-1 shrink-0" aria-hidden="true" />
        )}

        {/* Categorías Principales */}
        {directCategories.map((cat) => {
          const hasSubs = Boolean(cat.subCategories && cat.subCategories.length > 0);
          const isOpen = openDropdownId === cat.id;

          if (!hasSubs) {
            return (
              <Link
                key={cat.id}
                href={`/categorias/${cat.slug}`}
                onClick={closeAll}
                className="relative px-2.5 md:px-3 py-2 text-xs md:text-sm font-medium tracking-normal transition-colors text-gray-700 hover:text-accent group flex items-center h-full shrink-0 whitespace-nowrap"
              >
                <span>{cat.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-200 group-hover:w-full" />
              </Link>
            );
          }

          return (
            <div
              key={cat.id}
              className="relative group h-full flex items-center shrink-0"
              onMouseLeave={() => {
                setActiveFlyout(null);
              }}
            >
              {/* Botón interactivo de la Categoría */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick(cat.id, hasSubs);
                }}
                className={`relative px-2.5 md:px-3 py-2 text-xs md:text-sm font-medium tracking-normal transition-colors flex items-center gap-1.5 h-full shrink-0 whitespace-nowrap select-none ${
                  isOpen ? 'text-accent font-semibold' : 'text-gray-700 hover:text-accent'
                }`}
              >
                <span>{cat.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-accent' : 'md:group-hover:rotate-180 md:group-hover:text-accent'
                }`} />
                <span className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-200 ${
                  isOpen ? 'w-full' : 'w-0 md:group-hover:w-full'
                }`} />
              </button>

              {/* Dropdown flotante con subcategorías para COMPUTADORA / DESKTOP (Nivel 2) */}
              <div 
                className={`hidden md:block absolute top-full left-0 w-64 bg-white border border-gray-200 shadow-xl rounded-b-lg transition-all duration-150 transform z-50 py-2 ${
                  isOpen 
                    ? 'opacity-100 visible translate-y-0 pointer-events-auto' 
                    : 'opacity-0 invisible translate-y-1 pointer-events-none md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0 md:group-hover:pointer-events-auto'
                }`}
              >
                {/* Acceso a ver todo en la categoría principal */}
                <div className="px-4 py-2 mb-1 border-b border-gray-100">
                  <Link
                    href={`/categorias/${cat.slug}`}
                    onClick={closeAll}
                    className="text-xs font-bold text-accent hover:underline flex items-center justify-between"
                  >
                    <span>Ver todo en {cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Lista de subcategorías */}
                {cat.subCategories!.map((sub) => {
                  const hasLevel3 = Boolean(sub.subCategories && sub.subCategories.length > 0);
                  const isFlyoutActive = activeFlyout === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="relative group/sub"
                      onMouseEnter={() => hasLevel3 && setActiveFlyout(sub.id)}
                    >
                      <Link
                        href={`/categorias/${sub.slug}`}
                        onClick={closeAll}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors"
                      >
                        <span>{sub.name}</span>
                        {hasLevel3 && (
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover/sub:text-accent" />
                        )}
                      </Link>

                      {/* Flyout lateral a la derecha para Nivel 3 */}
                      {hasLevel3 && (
                        <div 
                          className={`absolute left-full top-0 w-56 bg-white border border-gray-200 shadow-xl rounded-r-lg transition-all duration-150 py-2 z-50 ${
                            isFlyoutActive 
                              ? 'opacity-100 visible pointer-events-auto' 
                              : 'opacity-0 invisible pointer-events-none md:group-hover/sub:opacity-100 md:group-hover/sub:visible md:group-hover/sub:pointer-events-auto'
                          }`}
                        >
                          <div className="px-4 py-1.5 mb-1 border-b border-gray-100">
                            <Link
                              href={`/categorias/${sub.slug}`}
                              onClick={closeAll}
                              className="text-xs font-bold text-accent hover:underline flex items-center justify-between"
                            >
                              <span>Ver todo en {sub.name}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          {sub.subCategories!.map((child) => (
                            <Link
                              key={child.id}
                              href={`/categorias/${child.slug}`}
                              onClick={closeAll}
                              className="block px-4 py-2 text-sm text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors"
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
            </div>
          );
        })}

        {/* Si hay más de MAX_DIRECT categorías, se agrupan en "+ Más" */}
        {extraCategories.length > 0 && (
          <div 
            className="relative group h-full flex items-center shrink-0"
            onMouseLeave={() => setActiveFlyout(null)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(prev => (prev === 'extra' ? null : 'extra'));
              }}
              className={`relative px-2.5 md:px-3 py-2 text-xs md:text-sm font-medium tracking-normal transition-colors flex items-center gap-1.5 h-full shrink-0 whitespace-nowrap select-none ${
                isOpen ? 'text-accent font-semibold' : 'text-gray-700 hover:text-accent'
              }`}
            >
              <span>+ Más</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-accent' : 'md:group-hover:rotate-180 md:group-hover:text-accent'
              }`} />
              <span className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-200 ${
                isOpen ? 'w-full' : 'w-0 md:group-hover:w-full'
              }`} />
            </button>

            {/* Desktop dropdown para Extra */}
            <div 
              className={`hidden md:block absolute top-full left-0 w-56 bg-white border border-gray-200 shadow-xl rounded-b-lg transition-all duration-150 transform z-50 py-2 ${
                openDropdownId === 'extra'
                  ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                  : 'opacity-0 invisible translate-y-1 pointer-events-none md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0 md:group-hover:pointer-events-auto'
              }`}
            >
              {extraCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorias/${cat.slug}`}
                  onClick={closeAll}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 px-4 pb-1">
                <Link
                  href="/productos"
                  onClick={closeAll}
                  className="text-xs font-semibold text-accent hover:underline block"
                >
                  Ver todo el catálogo →
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
