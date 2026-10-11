'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/services/api';
import { Category, Product, ProductVariant } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Trash2, Edit2, Layers } from 'lucide-react';

export default function EditarProducto({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Estado de gestión de variantes
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantForm, setVariantForm] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
  });
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariantData, setEditingVariantData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
  });
  const [variantLoading, setVariantLoading] = useState(false);

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
        const [cats, products, vars] = await Promise.all([
          fetcher<Category[]>('/admin/categories', { requireAuth: true }),
          fetcher<Product[]>('/admin/products', { requireAuth: true }),
          fetcher<ProductVariant[]>(`/admin/products/${params.id}/variants`, { requireAuth: true }).catch(() => [] as ProductVariant[])
        ]);
        setCategories(cats);
        setVariants(vars || []);

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

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.name.trim() || !variantForm.sku.trim() || !variantForm.price) {
      alert('Nombre, SKU y Precio son obligatorios para la variante.');
      return;
    }

    setVariantLoading(true);
    try {
      const newVar = await fetcher<ProductVariant>(`/admin/products/${params.id}/variants`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          name: variantForm.name.trim(),
          sku: variantForm.sku.trim(),
          price: parseFloat(variantForm.price),
          stock: variantForm.stock ? parseInt(variantForm.stock, 10) : 0,
        }),
      });

      setVariants([...variants, newVar]);
      setVariantForm({ name: '', sku: '', price: '', stock: '' });
      alert('Variante agregada exitosamente');
    } catch (err: any) {
      alert(err.message || 'Error al agregar variante');
    } finally {
      setVariantLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta variante?')) return;

    try {
      await fetcher(`/admin/products/${params.id}/variants/${variantId}`, {
        method: 'DELETE',
        requireAuth: true,
      });

      setVariants(variants.filter((v) => v.id !== variantId));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar variante');
    }
  };

  const handleStartEditVariant = (v: ProductVariant) => {
    setEditingVariantId(v.id);
    setEditingVariantData({
      name: v.name,
      sku: v.sku,
      price: v.price.toString(),
      stock: v.stock.toString(),
    });
  };

  const handleSaveEditVariant = async (variantId: string) => {
    if (!editingVariantData.name.trim() || !editingVariantData.sku.trim() || !editingVariantData.price) {
      alert('Nombre, SKU y Precio son requeridos');
      return;
    }

    try {
      const updated = await fetcher<ProductVariant>(`/admin/products/${params.id}/variants/${variantId}`, {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify({
          name: editingVariantData.name.trim(),
          sku: editingVariantData.sku.trim(),
          price: parseFloat(editingVariantData.price),
          stock: parseInt(editingVariantData.stock, 10) || 0,
        }),
      });

      setVariants(variants.map((v) => (v.id === variantId ? updated : v)));
      setEditingVariantId(null);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar variante');
    }
  };

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
          <div>
            <Input label="Stock Físico Inicial" type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
            <Link
              href={`/admin/inventario?search=${encodeURIComponent(form.sku)}`}
              className="text-xs text-primary hover:underline mt-1 block"
            >
              Ajustar stock con trazabilidad en Inventario →
            </Link>
          </div>
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

      {/* Sección de Gestión de Variantes de Producto (T-008, RF-001) */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-800" />
            <h2 className="text-xl font-bold text-gray-900">Variantes de este Producto</h2>
          </div>
          <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
            {variants.length} {variants.length === 1 ? 'variante' : 'variantes'}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Si defines variantes (por ejemplo, tallas o colores), cada una tendrá su propio SKU, precio y stock. Los clientes en la tienda deberán elegir una variante disponible para comprar.
        </p>

        {/* Lista de variantes existentes */}
        {variants.length > 0 ? (
          <div className="space-y-2 mb-6">
            {variants.map((v) => {
              const isEditing = editingVariantId === v.id;
              if (isEditing) {
                return (
                  <div key={v.id} className="p-3 bg-gray-50 border border-black rounded-lg space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Input
                        label="Nombre"
                        value={editingVariantData.name}
                        onChange={(e) => setEditingVariantData({ ...editingVariantData, name: e.target.value })}
                      />
                      <Input
                        label="SKU"
                        value={editingVariantData.sku}
                        onChange={(e) => setEditingVariantData({ ...editingVariantData, sku: e.target.value })}
                      />
                      <Input
                        label="Precio (Q)"
                        type="number"
                        step="0.01"
                        value={editingVariantData.price}
                        onChange={(e) => setEditingVariantData({ ...editingVariantData, price: e.target.value })}
                      />
                      <Input
                        label="Stock"
                        type="number"
                        value={editingVariantData.stock}
                        onChange={(e) => setEditingVariantData({ ...editingVariantData, stock: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingVariantId(null)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-black border border-gray-300 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditVariant(v.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-black text-white rounded-md hover:bg-zinc-800"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{v.name}</span>
                      <span className="text-xs font-mono bg-white px-2 py-0.5 border border-gray-200 rounded text-gray-600">
                        {v.sku}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Precio: <strong className="text-gray-900">Q{Number(v.price).toFixed(2)}</strong></span>
                      <span>Stock: <strong className={v.stock <= 0 ? 'text-red-600' : 'text-gray-900'}>{v.stock}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditVariant(v)}
                      className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors"
                      title="Editar variante"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(v.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar variante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center mb-6">
            <p className="text-xs text-gray-500">
              Este producto no tiene variantes y se vende como producto simple.
            </p>
          </div>
        )}

        {/* Formulario para agregar nueva variante */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Agregar Nueva Variante
          </h3>

          <form onSubmit={handleAddVariant} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre de variante"
                placeholder="ej. Talla XL / Negro"
                required
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
              />
              <Input
                label="SKU único"
                placeholder="ej. CAM-XL-BLK"
                required
                value={variantForm.sku}
                onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Precio (Q)"
                type="number"
                step="0.01"
                placeholder="ej. 95.00"
                required
                value={variantForm.price}
                onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
              />
              <Input
                label="Stock inicial"
                type="number"
                placeholder="ej. 10"
                value={variantForm.stock}
                onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={variantLoading}>
                {variantLoading ? 'Guardando...' : '+ Guardar Variante'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
