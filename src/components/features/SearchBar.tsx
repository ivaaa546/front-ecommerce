'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { fetcher } from '@/services/api';
import { Product } from '@/types';
import Link from 'next/link';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLFormElement>(null);

  // Cierra el autocompletado si el usuario hace clic afuera del buscador
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca sugerencias automáticamente mientras el usuario escribe (con un pequeño retraso para no saturar)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setLoading(true);
      try {
        // Usa el mismo endpoint de productos con la búsqueda
        const results = await fetcher<Product[]>(`/products?search=${encodeURIComponent(query.trim())}`);
        setSuggestions(results.slice(0, 5)); // Mostrar solo los top 5 resultados rápidos
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error al buscar sugerencias:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/productos?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/productos');
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    // Para que el input recupere el foco opcionalmente podríamos usar un ref en el input
  };

  return (
    <form ref={wrapperRef} onSubmit={handleSearch} role="search" className="relative w-full z-50">
      <label htmlFor="store-search-input" className="sr-only">
        Buscar productos en la tienda
      </label>
      <div className="relative">
        <input
          id="store-search-input"
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          autoComplete="off"
          className="w-full h-10 pl-11 pr-10 text-sm bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/40 transition-all outline-none text-gray-900 placeholder-gray-500"
        />
        <button 
          type="submit" 
          className="absolute inset-y-0 left-0 pl-4 flex items-center hover:text-accent focus:outline-none"
          aria-label="Buscar"
        >
          <Search className="w-4 h-4 text-gray-500 hover:text-accent transition-colors" aria-hidden="true" />
        </button>
        {query && (
          <button 
            type="button" 
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Resultados Autocompletados (Dropdown) */}
      {showSuggestions && query.trim() && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden origin-top animate-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-accent rounded-full animate-spin"></div>
              Buscando...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-[60vh] overflow-y-auto">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <Link 
                    href={`/${product.slug}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      setQuery('');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-10 h-10 object-cover rounded-md border border-gray-100" 
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-primary font-bold">Q {parseFloat(product.price).toFixed(2)}</p>
                    </div>
                  </Link>
                </li>
              ))}
              <li className="bg-gray-50 border-t border-gray-100">
                <button 
                  type="submit" 
                  className="w-full p-3 text-sm text-center text-accent hover:text-primary font-medium transition-colors"
                >
                  Ver todos los resultados
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron resultados para "{query}"
            </div>
          )}
        </div>
      )}
    </form>
  );
}
