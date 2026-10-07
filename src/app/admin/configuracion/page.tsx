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
  const [footerTagline, setFooterTagline] = useState('Tu tienda de confianza con pago contra entrega en toda Guatemala.');
  const [footerCopyright, setFooterCopyright] = useState('Todos los derechos reservados. Pago contra entrega garantizado.');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [metaPixelId, setMetaPixelId] = useState('');
  const [banners, setBanners] = useState<{ imageUrl: string, text: string, linkUrl: string }[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const [quickLinksActive, setQuickLinksActive] = useState(true);
  const [quickLinks, setQuickLinks] = useState<{ text: string, url: string }[]>([]);

  const [loadError, setLoadError] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetcher<any>('/settings');
      if (res.storeName) setStoreName(res.storeName);
      if (res.footerTagline) setFooterTagline(res.footerTagline);
      if (res.footerCopyright) setFooterCopyright(res.footerCopyright);
      if (res.logoUrl) setLogoUrl(res.logoUrl);
      if (res.metaPixelId) setMetaPixelId(res.metaPixelId);
      if (res.quickLinksActive !== undefined) setQuickLinksActive(res.quickLinksActive);
      if (res.quickLinks) setQuickLinks(res.quickLinks);

      setShipping({ type: res.shipping.type, amount: res.shipping.amount });
      // Si ya hay banners en el array usamos eso, sino caemos en el banner legacy si existe
      if (res.banners && res.banners.length > 0) {
        setBanners(res.banners);
      } else if (res.banner?.imageUrl) {
        setBanners([res.banner]);
      }
    } catch (err: any) {
      setLoadError(err?.message || 'No se pudieron cargar los ajustes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', 'logo');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (!response.ok) throw new Error('No se pudo subir el logo');
      const data = await response.json();
      setLogoUrl(data.url);
      await fetcher('/admin/settings/logo', { method: 'PUT', requireAuth: true, body: JSON.stringify({ logoUrl: data.url }) });
      alert('Logo actualizado correctamente');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setSaving(true);
    try {
      await fetcher('/admin/settings/logo', { method: 'PUT', requireAuth: true, body: JSON.stringify({ logoUrl: '' }) });
      setLogoUrl('');
      alert('Logo eliminado. Se mostrará el nombre de la tienda.');
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

  const handleSaveMetaPixel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetcher('/admin/settings/meta-pixel', {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify({ metaPixelId }),
      });
      alert('Meta Pixel actualizado correctamente');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetcher('/admin/settings/footer', { method: 'PUT', requireAuth: true, body: JSON.stringify({ tagline: footerTagline, copyright: footerCopyright }) });
      alert('Footer actualizado correctamente');
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
      alert('Campañas actualizadas correctamente');
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

  if (loadError) {
    return (
      <div className="max-w-2xl space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-2xl font-bold">No se pudo cargar la configuración</h1>
        <p className="text-sm">{loadError}</p>
        <Button type="button" onClick={loadSettings}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <h1 className="text-3xl font-bold text-primary mb-8">Configuración de la Tienda</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-primary mb-6 border-b pb-2">Configuración General</h2>
        <form onSubmit={handleSaveStoreName} className="space-y-4 max-w-md">
          <Input label="Nombre de la Tienda" type="text" required value={storeName} onChange={e => setStoreName(e.target.value)} />
          <Button type="submit" disabled={saving}>Guardar Nombre</Button>
        </form>
        <div className="mt-8 border-t border-gray-100 pt-6 max-w-md">
          <label className="text-sm font-medium text-gray-700">Logo de la tienda</label>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">Se adapta a logos horizontales, cuadrados o verticales. Dimensión recomendada: 600 × 150 px para logos horizontales. En escritorio reserva hasta 240 × 56 px. Usa PNG o SVG con fondo transparente.</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-36 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2">
              {logoUrl ? <img src={logoUrl} alt="Vista previa del logo" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-gray-400">Sin logo</span>}
            </div>
            <div className="flex flex-col gap-2">
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} disabled={uploadingLogo} className="max-w-[220px] text-sm" />
              {logoUrl && <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo} disabled={saving}>Usar nombre en su lugar</Button>}
            </div>
          </div>
          {uploadingLogo && <p className="mt-2 text-xs text-gray-500">Subiendo logo...</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
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
              <div key={idx} className="flex gap-4 items-start p-4 border border-gray-100 bg-gray-50 rounded-lg">
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

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-primary mb-6 border-b pb-2">Costo de Envío</h2>
        <form onSubmit={handleSaveShipping} className="space-y-4 max-w-md">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Tipo de envío</label>
            <select
              className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2"
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

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-primary mb-2">Seguimiento de anuncios</h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-neutral-600">Conecta Meta Pixel para medir visitas, productos vistos, búsquedas, carritos, checkout y compras. Déjalo vacío para desactivar el seguimiento.</p>
        <form onSubmit={handleSaveMetaPixel} className="space-y-4 max-w-md">
          <Input label="ID del Pixel de Meta" value={metaPixelId} onChange={e => setMetaPixelId(e.target.value)} placeholder="Ej. 123456789012345" inputMode="numeric" />
          <Button type="submit" disabled={saving}>Guardar Pixel</Button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-primary mb-2">Texto del pie de página</h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-neutral-600">Personaliza la descripción de tu tienda y el texto legal que aparece debajo de los enlaces.</p>
        <form onSubmit={handleSaveFooter} className="space-y-4 max-w-2xl">
          <Input label="Descripción del footer" value={footerTagline} onChange={e => setFooterTagline(e.target.value)} placeholder="Tu tienda de confianza..." />
          <Input label="Texto de derechos reservados" value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} placeholder="Todos los derechos reservados..." />
          <Button type="submit" disabled={saving}>Guardar texto</Button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-bold text-primary">Campañas de la portada</h2>
          <Button variant="outline" size="sm" onClick={addBanner}>+ Añadir campaña</Button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-neutral-600">Cada campaña puede tener una imagen, un título y un enlace a cualquier categoría o producto. La portada muestra una campaña principal y hasta dos campañas adicionales al lado. Con varias, el cliente puede cambiar la principal usando las flechas. No cambian automáticamente. Para aprovechar el espacio, utiliza imágenes horizontales de aproximadamente 2:1.</p>
        <form onSubmit={handleSaveBanners} className="space-y-8">
          {banners.map((banner, idx) => (
            <div key={idx} className="p-4 border border-gray-200 bg-gray-50 rounded-xl relative">
              <button
                type="button"
                onClick={() => removeBanner(idx)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold bg-red-100 px-2 py-1 rounded"
              >
                Eliminar
              </button>

              <h3 className="font-semibold text-gray-700 mb-4">Campaña #{idx + 1}</h3>

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
                  {uploadingIdx === idx && <span className="text-xs text-neutral-500">Subiendo imagen...</span>}
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
            <Button type="submit" disabled={saving || uploadingIdx !== null}>Guardar campañas</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
