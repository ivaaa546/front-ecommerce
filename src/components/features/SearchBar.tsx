'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/productos?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/productos');
    }
  };

  return (
    <form onSubmit={handleSearch} role="search" className="relative w-full">
      <label htmlFor="store-search-input" className="sr-only">
        Buscar productos en la tienda
      </label>
      <input
        id="store-search-input"
        type="search"
        placeholder="Buscar productos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-10 pl-11 pr-4 text-sm bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/40 transition-all outline-none text-gray-900 placeholder-gray-500"
      />
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-500" aria-hidden="true" />
      </div>
    </form>
  );
}
