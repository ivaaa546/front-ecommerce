'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, ChevronRight, ChevronDown } from 'lucide-react';
import { Category } from '@/types';

interface CategoryMenuProps {
  categories: Category[];
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(
    categories.length > 0 ? categories[0] : null
  );

  return (
    <div className="hidden md:flex items-center relative group h-full">
      <button 
        type="button"
        className="h-full flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary transition-colors py-2 focus:outline-none"
      >
        <LayoutGrid className="w-4 h-4 text-primary" />
        <span>Categorías</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
      </button>

      {/* Mega Menú */}
      <div className="absolute top-full left-0 w-[800px] bg-white border border-gray-100 shadow-xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-1 group-hover:translate-y-0 flex z-50 overflow-hidden" style={{ minHeight: '400px' }}>
        
        {/* Lado izquierdo: Lista de categorías principales */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col py-2 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat)}
              className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${
                activeCategory?.id === cat.id
                  ? 'bg-white text-accent border-l-4 border-accent font-medium'
                  : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
              }`}
            >
              <span className="text-sm">{cat.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>

        {/* Lado derecho: Subcategorías o contenido de la categoría activa */}
        <div className="w-2/3 bg-white p-8 overflow-y-auto">
          {activeCategory ? (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <Link 
                  href={`/categorias/${activeCategory.slug}`}
                  className="inline-flex items-center text-2xl font-bold text-gray-900 hover:text-accent transition-colors"
                >
                  Ver todo en {activeCategory.name} <ChevronRight className="w-6 h-6 ml-2" />
                </Link>
              </div>

              {/* Subcategorías reales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                  activeCategory.subCategories.map((subCat) => (
                    <div key={subCat.id} className="break-inside-avoid mb-6">
                      <Link href={`/categorias/${subCat.slug}`}>
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center cursor-pointer hover:text-accent">
                          {subCat.name} <ChevronRight className="w-4 h-4 ml-1" />
                        </h4>
                      </Link>
                      
                      {subCat.subCategories && subCat.subCategories.length > 0 && (
                        <ul className="space-y-3">
                          {subCat.subCategories.map(item => (
                            <li key={item.id}>
                              <Link href={`/categorias/${item.slug}`} className="text-sm text-gray-600 hover:text-accent hover:underline">
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-sm text-gray-400 py-8">
                    No hay subcategorías registradas para esta categoría todavía.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Selecciona una categoría
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
