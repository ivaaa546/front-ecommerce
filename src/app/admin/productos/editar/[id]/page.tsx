'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/services/api';
import { Category, Product } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function EditarProducto({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    previousPrice: '',
    stock: '',
    sku: '',
    categoryId: '',
    imageUrl: '',
  });

  useEffect(() => {
    // Cargar categorías y producto a la vez
    const loadData = async () => {
      try {
        const [cats, products] = await Promise.all([
          fetcher<Category[]>('/admin/categories', { requireAuth: true }),
          fetcher<Product[]>('/admin/products', { requireAuth: true })
        ]);
        setCategories(cats);
        
        // Encontrar el producto
        const product = products.find(p => p.id === params.id);
        if (product) {
          setForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            previousPrice: product.previousPrice ? product.previousPrice.toString() : '',
            stock: product.stock.toString(),
            sku: product.sku,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
          });
        } else {
          alert('Producto no encontrado');
          router.push('/admin/productos');
        }
      } catch (err: any) {
        alert(err.message || 'Error cargando datos');
      } finally {
        setFetchingData(false);
      }
    };
    
    loadData();
  }, [params.id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Error subiendo imagen');
      const data = await res.json();
      setForm({ ...form, imageUrl: data.url });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetcher(`/admin/products/${params.id}`, {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          previousPrice: form.previousPrice ? parseFloat(form.previousPrice) : null,
          stock: parseInt(form.stock, 10),
        }),
      });
      router.push('/admin/productos');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar producto');
      setLoading(false);
    }
  };

  const getCategoryPath = (cat: Category, allCats: Category[]): string => {
    if (!cat.parentId) return cat.name;
    const parent = allCats.find(c => c.id === cat.parentId);
    if (!parent) return cat.name;
    return `${getCategoryPath(parent, allCats)} > ${cat.name}`;
  };

  const sortedCategories = [...categories].sort((a, b) => 
    getCategoryPath(a, categories).localeCompare(getCategoryPath(b, categories))
  );

  if (fetchingData) {
    return <div className="p-8">Cargando información del producto...</div>;
  }

  return (
    <div className="max-w-2xl bg-white border border-gray-200 rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Editar Producto</h1>
        <Link href="/admin/productos" className="text-sm text-gray-500 hover:text-accent">Cancelar</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Descripción</label>
          <textarea 
            required 
            className="w-full rounded-md border border-gray-300 p-2 text-sm" 
            rows={4}
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Precio (Q)" type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <Input label="Precio Anterior (opcional)" type="number" step="0.01" value={form.previousPrice} onChange={e => setForm({...form, previousPrice: e.target.value})} />
          <Input label="Stock" type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
          <Input label="SKU" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Categoría o Subcategoría</label>
          <select 
            required 
            className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
            value={form.categoryId}
            onChange={e => setForm({...form, categoryId: e.target.value})}
          >
            <option value="">Selecciona una categoría</option>
            {sortedCategories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c, categories)}</option>)}
          </select>
        </div>

        <div className="flex flex-col space-y-2 pt-2 border-t">
          <label className="text-sm font-medium text-gray-700">Imagen del producto</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          {uploading && <span className="text-xs text-blue-500">Subiendo imagen a Cloudinary...</span>}
          {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-32 object-contain bg-gray-100 rounded border" />}
        </div>

        <div className="pt-4">
          <Button type="submit" fullWidth disabled={loading || uploading || !form.imageUrl}>
            {loading ? 'Actualizando...' : 'Actualizar Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
