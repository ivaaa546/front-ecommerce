import React from 'react';
import Link from 'next/link';
import { fetcher } from '@/services/api';

export default async function Footer() {
  let storeName = 'E-COMMERCE';
  try {
    const res = await fetcher<any>('/settings');
    if (res?.storeName) storeName = res.storeName;
  } catch (err) {
    // ignorar error
  }

  return (
    <footer className="bg-primary text-white py-10 border-t border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-xl font-bold tracking-tighter text-accent-light">{storeName.toUpperCase()}</span>
          <p className="text-sm text-gray-300 mt-2">Tu tienda de confianza con pago contra entrega en toda Guatemala.</p>
        </div>
        
        <nav aria-label="Enlaces del pie de página" className="flex flex-wrap gap-6 text-sm text-gray-300">
          <Link href="/productos" className="hover:text-white transition-colors">
            Catálogo
          </Link>
          <Link href="/carrito" className="hover:text-white transition-colors">
            Carrito
          </Link>
          <Link href="/admin/login" className="hover:text-white transition-colors">
            Panel Administrativo
          </Link>
        </nav>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {storeName}. Todos los derechos reservados. Pago contra entrega garantizado.
      </div>
    </footer>
  );
}
