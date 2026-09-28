'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pedidos Recientes</h3>
          <p className="text-gray-500 text-sm mb-4">Gestiona los pedidos entrantes y actualiza su estado.</p>
          <Link href="/admin/pedidos" className="text-accent font-medium hover:underline">Ver pedidos &rarr;</Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Catálogo</h3>
          <p className="text-gray-500 text-sm mb-4">Añade o edita productos e inventario.</p>
          <Link href="/admin/productos" className="text-accent font-medium hover:underline">Gestionar productos &rarr;</Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ajustes de Tienda</h3>
          <p className="text-gray-500 text-sm mb-4">Configura el costo de envío y el banner principal.</p>
          <Link href="/admin/configuracion" className="text-accent font-medium hover:underline">Ir a configuración &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
