'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/services/api';
import { Category } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface PendingVariant {
  name: string;
  sku: string;
  price: string;
  stock: string;
  images: string[];
}

export default function NuevoProducto() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Formulario de producto base
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

  // Estado para variantes
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<PendingVariant[]>([]);

  // Formulario para nueva variante
  const [currentVariant, setCurrentVariant] = useState<PendingVariant>({
    name: '',
    sku: '',
    price: '',
    stock: '',
    images: [],
  });
  const [uploadingVariantImg, setUploadingVariantImg] = useState(false);

  useEffect(() => {
    fetcher<Category[]>('/admin/categories', { requireAuth: true }).then(setCategories);
  }, []);

  // Subir imágenes principales del producto
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (form.images.length + files.length > 5) {
      alert('Puedes subir un máximo de 5 imágenes para el producto.');
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
        imageUrl: updatedImages[0] || form.imageUrl,
      });
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen');
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
      imageUrl: newImages[0] || '',
    });
  };

  // Subir imágenes para la variante en edición
  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (currentVariant.images.length + files.length > 3) {
      alert('Puedes subir un máximo de 3 imágenes por variante.');
      return;
    }

    setUploadingVariantImg(true);
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
        if (!res.ok) throw new Error('Error subiendo imagen de variante');
        const data = await res.json();
        newUrls.push(data.url);
      }

      setCurrentVariant((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen de variante');
    } finally {
      setUploadingVariantImg(false);
    }
  };

  const removeVariantImage = (index: number) => {
    setCurrentVariant((prev) => {
      const updated = [...prev.images];
      updated.splice(index, 1);
      return { ...prev, images: updated };
    });
  };

  // Añadir la variante actual a la lista
  const handleAddVariantToList = () => {
    if (!currentVariant.name.trim()) {
      alert('El nombre de la variante es obligatorio (ej. Talla M / Azul).');
      return;
    }
    if (!currentVariant.sku.trim()) {
      alert('El SKU de la variante es obligatorio.');
      return;
    }
    if (!currentVariant.price || parseFloat(currentVariant.price) < 0) {
      alert('El precio de la variante debe ser un número válido.');
      return;
    }

    // Verificar si el SKU ya existe en la lista temporal
    if (variantsList.some((v) => v.sku.toLowerCase() === currentVariant.sku.trim().toLowerCase())) {
      alert('Ya agregaste una variante con ese mismo SKU.');
      return;
    }

    setVariantsList([...variantsList, { ...currentVariant, name: currentVariant.name.trim(), sku: currentVariant.sku.trim() }]);
    setCurrentVariant({
      name: '',
      sku: '',
      price: form.price || '',
      stock: '',
      images: [],
    });
  };

  const handleRemoveVariantFromList = (index: number) => {
    const updated = [...variantsList];
    updated.splice(index, 1);
    setVariantsList(updated);
  };

  // Enviar y crear producto + variantes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasVariants && variantsList.length === 0) {
      alert('Activaste las variantes pero no has agregado ninguna a la lista. Agrega al menos una variante o desmarca la opción.');
      return;
    }

    setLoading(true);
    try {
      // Calcular stock base
      const totalStock = hasVariants
        ? variantsList.reduce((acc, v) => acc + (parseInt(v.stock, 10) || 0), 0)
        : parseInt(form.stock, 10) || 0;

      // 1. Crear producto base
      const newProduct = await fetcher<{ id: string }>('/admin/products', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          previousPrice: form.previousPrice ? parseFloat(form.previousPrice) : undefined,
          stock: totalStock,
        }),
      });

      // 2. Si tiene variantes, crearlas asociadas al nuevo producto
      if (hasVariants && variantsList.length > 0) {
        for (const variant of variantsList) {
          await fetcher(`/admin/products/${newProduct.id}/variants`, {
            method: 'POST',
            requireAuth: true,
            body: JSON.stringify({
              name: variant.name,
              sku: variant.sku,
              price: parseFloat(variant.price),
              stock: variant.stock ? parseInt(variant.stock, 10) : 0,
              images: variant.images,
            }),
          });
        }
      }

      router.push('/admin/productos');
    } catch (err: any) {
      alert(err.message || 'Error al crear producto');
      setLoading(false);
    }
  };

  const getCategoryPath = (cat: Category, allCats: Category[]): string => {
    if (!cat.parentId) return cat.name;
    const parent = allCats.find((c) => c.id === cat.parentId);
    if (!parent) return cat.name;
    return `${getCategoryPath(parent, allCats)} > ${cat.name}`;
  };

  const sortedCategories = [...categories].sort((a, b) =>
    getCategoryPath(a, categories).localeCompare(getCategoryPath(b, categories))
  );

  return (
    <div className="max-w-3xl bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Nuevo Producto</h1>
          <p className="text-xs text-neutral-500 mt-1">Crea productos simples o con variantes de color, talla y modelo.</p>
        </div>
        <Link href="/admin/productos" className="text-sm text-gray-500 hover:text-accent">
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información general */}
        <div className="space-y-4">
          <Input label="Nombre del Producto" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              required
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Precio base (Q)"
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => {
                setForm({ ...form, price: e.target.value });
                if (!currentVariant.price) {
                  setCurrentVariant((prev) => ({ ...prev, price: e.target.value }));
                }
              }}
            />
            <Input
              label="Precio Anterior / Oferta (opcional)"
              type="number"
              step="0.01"
              value={form.previousPrice}
              onChange={(e) => setForm({ ...form, previousPrice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Principal"
              required
              placeholder="ej. PROD-001"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            {!hasVariants && (
              <Input
                label="Stock inicial"
                type="number"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Categoría o Subcategoría</label>
            <select
              required
              className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Selecciona una categoría</option>
              {sortedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryPath(c, categories)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Imágenes generales del producto */}
        <div className="flex flex-col space-y-2 pt-4 border-t">
          <label className="text-sm font-semibold text-gray-800">Imágenes del producto (Foto principal y galería - Máx 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading || form.images.length >= 5}
            className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
          />
          {uploading && <span className="text-xs text-neutral-500">Subiendo imágenes...</span>}

          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="Preview" className="h-20 w-20 object-cover bg-gray-50 rounded-lg border" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 bg-primary text-white text-[9px] font-semibold px-1 w-full text-center rounded-b-lg">
                      Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Variantes */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <p className="text-sm font-semibold text-neutral-900">¿Este producto tiene variantes?</p>
              <p className="text-xs text-neutral-500">Actívalo si tiene diferentes colores, tallas o capacidades.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => {
                  setHasVariants(e.target.checked);
                  if (e.target.checked && !currentVariant.price) {
                    setCurrentVariant((prev) => ({ ...prev, price: form.price }));
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {hasVariants && (
            <div className="space-y-4 rounded-xl border border-neutral-200 p-4 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Agregar Variante
                </h3>
                {variantsList.length > 0 && (
                  <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {variantsList.length} {variantsList.length === 1 ? 'agregada' : 'agregadas'}
                  </span>
                )}
              </div>

              {/* Formulario para añadir una variante */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nombre de variante"
                    placeholder="ej. Azul / Talla M, Negro 128GB"
                    value={currentVariant.name}
                    onChange={(e) => setCurrentVariant({ ...currentVariant, name: e.target.value })}
                  />
                  <Input
                    label="SKU de la variante"
                    placeholder="ej. CAM-AZL-M"
                    value={currentVariant.sku}
                    onChange={(e) => setCurrentVariant({ ...currentVariant, sku: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Precio específico (Q)"
                    type="number"
                    step="0.01"
                    placeholder="ej. 95.00"
                    value={currentVariant.price}
                    onChange={(e) => setCurrentVariant({ ...currentVariant, price: e.target.value })}
                  />
                  <Input
                    label="Stock disponible"
                    type="number"
                    placeholder="ej. 15"
                    value={currentVariant.stock}
                    onChange={(e) => setCurrentVariant({ ...currentVariant, stock: e.target.value })}
                  />
                </div>

                {/* Subida de fotos específicas para la variante (ej. foto del color específico) */}
                <div className="space-y-2 pt-1 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                      Foto del color o variante (Opcional - Máx 3)
                    </label>
                    <span className="text-[11px] text-neutral-400">Se mostrará cuando el cliente elija este color/opción</span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleVariantImageUpload}
                    disabled={uploadingVariantImg || currentVariant.images.length >= 3}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-white file:border-neutral-300 file:border hover:file:bg-neutral-100"
                  />
                  {uploadingVariantImg && <span className="text-xs text-neutral-500">Subiendo foto de variante...</span>}

                  {currentVariant.images.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {currentVariant.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img src={imgUrl} alt="Variante preview" className="h-14 w-14 object-cover rounded border bg-white" />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddVariantToList}
                    disabled={uploadingVariantImg}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir a la lista de variantes
                  </button>
                </div>
              </div>

              {/* Lista de variantes agregadas */}
              {variantsList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Variantes que se guardarán ({variantsList.length})
                  </h4>
                  <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden bg-white">
                    {variantsList.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-3 text-xs hover:bg-neutral-50 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          {v.images.length > 0 ? (
                            <img src={v.images[0]} alt={v.name} className="h-10 w-10 object-cover rounded border bg-neutral-100 shrink-0" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-neutral-100 text-neutral-400 rounded border shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">{v.name}</p>
                            <p className="text-[11px] text-neutral-500 font-mono">
                              SKU: {v.sku} • Stock: {v.stock || 0} • Q{parseFloat(v.price).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariantFromList(i)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón submit */}
        <div className="pt-4 border-t">
          <Button type="submit" fullWidth disabled={loading || uploading || uploadingVariantImg || !form.imageUrl}>
            {loading ? 'Creando producto y variantes...' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
