'use client';

import React, { useEffect, useState } from 'react';
import { fetcher } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [shipping, setShipping] = useState({ type: 'FIXED', amount: '30' });
  const [storeName, setStoreName] = useState('E-COMMERCE');
  const [banners, setBanners] = useState<{ imageUrl: string, text: string, linkUrl: string }[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const [quickLinksActive, setQuickLinksActive] = useState(true);
  const [quickLinks, setQuickLinks] = useState<{ text: string, url: string }[]>([]);

  useEffect(() => {
    fetcher<any>('/settings').then(res => {
      if (res.storeName) setStoreName(res.storeName);
      if (res.quickLinksActive !== undefined) setQuickLinksActive(res.quickLinksActive);
      if (res.quickLinks) setQuickLinks(res.quickLinks);

      setShipping({ type: res.shipping.type, amount: res.shipping.amount });
      // Si ya hay banners en el array usamos eso, sino caemos en el banner legacy si existe
      if (res.banners && res.banners.length > 0) {
        setBanners(res.banners);
      } else if (res.banner?.imageUrl) {
        setBanners([res.banner]);
      }
      setLoading(false);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(idx);
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

      const newBanners = [...banners];
      newBanners[idx].imageUrl = data.url;
      setBanners(newBanners);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSaveStoreName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetcher('/admin/settings/store-name', {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify({ storeName }),
      });
      alert('Nombre de la tienda actualizado correctamente');
      window.location.reload(); // Para que el Navbar refresque
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetcher('/admin/settings/shipping', {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify({ type: shipping.type, amount: parseFloat(shipping.amount) }),
      });
      alert('Envío actualizado correctamente');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Filtrar banners inválidos sin imagen
      const validBanners = banners.filter(b => b.imageUrl);
      await fetcher('/admin/settings/banners', {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify({ banners: validBanners }),
      });
      alert('Slider actualizado correctamente');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    setBanners([...banners, { imageUrl: '', text: '', linkUrl: '' }]);
  };

  const removeBanner = (idx: number) => {
    const newBanners = [...banners];
    newBanners.splice(idx, 1);
    setBanners(newBanners);
  };

  const updateBannerField = (idx: number, field: string, value: string) => {
    const newBanners = [...banners] as any;
    newBanners[idx][field] = value;
    setBanners(newBanners);
  };

  const handleSaveQuickLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetcher('/admin/settings/quick-links', {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify({ active: quickLinksActive, links: quickLinks }),
      });
      alert('Enlaces rápidos actualizados correctamente');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addQuickLink = () => {
    setQuickLinks([...quickLinks, { text: '', url: '' }]);
  };

  const removeQuickLink = (idx: number) => {
    const newLinks = [...quickLinks];
    newLinks.splice(idx, 1);
    setQuickLinks(newLinks);
  };

  const updateQuickLinkField = (idx: number, field: string, value: string) => {
    const newLinks = [...quickLinks] as any;
    newLinks[idx][field] = value;
    setQuickLinks(newLinks);
  };

  if (loading) return <div>Cargando ajustes...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <h1 className="text-3xl font-bold text-primary mb-8">Configuración de la Tienda</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <h2 className="text-xl font-bold text-primary mb-6 border-b pb-2">Configuración General</h2>
        <form onSubmit={handleSaveStoreName} className="space-y-4 max-w-md">
          <Input
            label="Nombre de la Tienda"
            type="text"
            required
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
          />
          <Button type="submit" disabled={saving}>Guardar Nombre</Button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-bold text-primary">Enlaces Rápidos (Debajo del buscador)</h2>
          <Button variant="outline" size="sm" onClick={addQuickLink}>+ Añadir Enlace</Button>
        </div>

        <form onSubmit={handleSaveQuickLinks} className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="qlActive"
              checked={quickLinksActive}
              onChange={e => setQuickLinksActive(e.target.checked)}
              className="w-4 h-4 text-accent rounded focus:ring-accent"
            />
            <label htmlFor="qlActive" className="text-sm font-medium text-gray-700">
              Mostrar barra de enlaces rápidos
            </label>
          </div>

          <div className="space-y-4">
            {quickLinks.map((link, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 border border-gray-100 bg-gray-50 rounded-md">
                <div className="flex-1 space-y-4">
                  <Input
                    label="Texto (Ej. Ofertas)"
                    value={link.text}
                    onChange={e => updateQuickLinkField(idx, 'text', e.target.value)}
                  />
                  <Input
                    label="URL (Ej. /productos?category=ofertas)"
                    value={link.url}
                    onChange={e => updateQuickLinkField(idx, 'url', e.target.value)}
                  />
                </div>
                <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 mt-7" onClick={() => removeQuickLink(idx)}>
                  Quitar
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={saving}>Guardar Enlaces</Button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <h2 className="text-xl font-bold text-primary mb-6 border-b pb-2">Costo de Envío</h2>
        <form onSubmit={handleSaveShipping} className="space-y-4 max-w-md">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Tipo de envío</label>
            <select
              className="h-10 w-full rounded-md border border-gray-300 px-3 py-2"
              value={shipping.type}
              onChange={e => setShipping({ ...shipping, type: e.target.value })}
            >
              <option value="FIXED">Fijo</option>
              <option value="FREE">Gratis</option>
            </select>
          </div>
          {shipping.type === 'FIXED' && (
            <Input
              label="Monto (Q)"
              type="number"
              step="0.01"
              required
              value={shipping.amount}
              onChange={e => setShipping({ ...shipping, amount: e.target.value })}
            />
          )}
          <Button type="submit" disabled={saving}>Guardar Envío</Button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-bold text-primary">Slider Principal (Banners)</h2>
          <Button variant="outline" size="sm" onClick={addBanner}>+ Añadir Slide</Button>
        </div>

        <form onSubmit={handleSaveBanners} className="space-y-8">
          {banners.map((banner, idx) => (
            <div key={idx} className="p-4 border border-gray-200 bg-gray-50 rounded-lg relative">
              <button
                type="button"
                onClick={() => removeBanner(idx)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold bg-red-100 px-2 py-1 rounded"
              >
                Eliminar
              </button>

              <h3 className="font-semibold text-gray-700 mb-4">Slide #{idx + 1}</h3>

              <div className="space-y-4">
                <Input
                  label="Texto del Banner (opcional)"
                  value={banner.text || ''}
                  onChange={e => updateBannerField(idx, 'text', e.target.value)}
                  placeholder="Ej. ¡Gran Venta!"
                />
                <Input
                  label="Enlace (URL, opcional)"
                  value={banner.linkUrl || ''}
                  onChange={e => updateBannerField(idx, 'linkUrl', e.target.value)}
                  placeholder="Ej. /productos?category=verano"
                />

                <div className="flex flex-col space-y-2 pt-2">
                  <label className="text-sm font-medium text-gray-700">Imagen de fondo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} disabled={uploadingIdx === idx} />
                  {uploadingIdx === idx && <span className="text-xs text-blue-500">Subiendo imagen...</span>}
                  {banner.imageUrl && (
                    <div className="mt-2 relative h-32 bg-gray-100 border rounded overflow-hidden">
                      <img src={banner.imageUrl} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <p className="text-gray-500 italic text-sm">No hay banners configurados. Agrega uno.</p>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Button type="submit" disabled={saving || uploadingIdx !== null}>Guardar Slider</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
