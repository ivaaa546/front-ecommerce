'use client';

import React, { useEffect, useState } from 'react';
import { fetcher } from '@/services/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/BadgeCard';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatParentId, setNewCatParentId] = useState('');

  const loadCategories = async () => {
    try {
      const data = await fetcher<Category[]>('/admin/categories', { requireAuth: true });
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingCat(null);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatParentId('');
    setIsFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description || '');
    setNewCatParentId(cat.parentId || '');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCat(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = JSON.stringify({
        name: newCatName,
        description: newCatDesc,
        parentId: newCatParentId || null
      });

      if (editingCat) {
        // Edit existing
        await fetcher(`/admin/categories/${editingCat.id}`, {
          method: 'PUT',
          requireAuth: true,
          body,
        });
      } else {
        // Create new
        await fetcher('/admin/categories', {
          method: 'POST',
          requireAuth: true,
          body,
        });
      }

      closeForm();
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetcher(`/admin/categories/${id}/status`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({ status: newStatus }),
      });
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría? Solo se podrá si no tiene productos activos.')) return;
    try {
      await fetcher(`/admin/categories/${id}`, { method: 'DELETE', requireAuth: true });
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-primary">Categorías</h1>
        <Button onClick={isFormOpen ? closeForm : openCreate}>
          {isFormOpen ? 'Cancelar' : '+ Nueva Categoría'}
        </Button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 mb-6 rounded">{error}</div>}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 border border-gray-200 rounded-xl mb-8 max-w-md">
          <h2 className="text-lg font-bold mb-4 text-primary">
            {editingCat ? 'Editar Categoría' : 'Crear Categoría'}
          </h2>
          <div className="space-y-4">
            <Input label="Nombre *" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            <Input label="Descripción" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Padre (Opcional)</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white"
                value={newCatParentId}
                onChange={(e) => setNewCatParentId(e.target.value)}
              >
                <option value="">Ninguna (Categoría Principal)</option>
                {categories.map(c => (
                  // Evitar que una categoría sea padre de sí misma
                  c.id !== editingCat?.id && (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  )
                ))}
              </select>
            </div>
            <Button type="submit">{editingCat ? 'Actualizar Categoría' : 'Guardar Categoría'}</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium text-gray-600">Nombre</th>
              <th className="p-4 font-medium text-gray-600">Jerarquía</th>
              <th className="p-4 font-medium text-gray-600">Estado</th>
              <th className="p-4 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className="font-medium text-primary block">{cat.name}</span>
                  <span className="text-xs text-gray-400">/{cat.slug}</span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {cat.parent ? (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                      Hija de: <b>{cat.parent.name}</b>
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Principal</span>
                  )}
                </td>
                <td className="p-4">
                  <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'default'}>{cat.status}</Badge>
                </td>
                <td className="p-4 space-x-3">
                  <button onClick={() => openEdit(cat)} className="text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleToggleStatus(cat.id, cat.status)} className="text-sm text-neutral-600 hover:text-neutral-800 transition-colors">
                    {cat.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-sm text-red-600 hover:text-red-800 transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No hay categorías registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
