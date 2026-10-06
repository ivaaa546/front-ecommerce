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
    images: [] as string[],
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
            images: product.images || (product.imageUrl ? [product.imageUrl] : []),
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (form.images.length + files.length > 5) {
      alert('Puedes subir un máximo de 5 imágenes.');
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      const token = localStorage.getItem('token');
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/uploads`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Error subiendo imagen');
        const data = await res.json();
        newUrls.push(data.url);
      }

      const updatedImages = [...form.images, ...newUrls];
      setForm({
        ...form,
        images: updatedImages,
        imageUrl: updatedImages[0] || form.imageUrl // La primera es la principal
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm({
      ...form,
      images: newImages,
      imageUrl: newImages[0] || ''
    });
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
    <div className="max-w-2xl bg-white border border-gray-200 rounded-xl p-8">
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
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
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
            className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            value={form.categoryId}
            onChange={e => setForm({...form, categoryId: e.target.value})}
          >
            <option value="">Selecciona una categoría</option>
            {sortedCategories.map(c => <option key={c.id} value={c.id}>{getCategoryPath(c, categories)}</option>)}
          </select>
        </div>

        <div className="flex flex-col space-y-2 pt-2 border-t">
          <label className="text-sm font-medium text-gray-700">Imágenes del producto (Máx 5)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading || form.images.length >= 5} />
          {uploading && <span className="text-xs text-neutral-500">Subiendo imágenes a Cloudinary...</span>}

          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="Preview" className="h-24 w-24 object-cover bg-gray-100 rounded border" />
                  {i === 0 && <span className="absolute bottom-0 left-0 bg-primary text-white text-[10px] px-1 w-full text-center">Principal</span>}
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">×</button>
                </div>
              ))}
            </div>
          )}
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
