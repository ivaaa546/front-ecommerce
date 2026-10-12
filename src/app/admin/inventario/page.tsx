'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetcher } from '@/services/api';
import {
  InventoryItem,
  InventoryListResponse,
  InventoryMovementDTO,
  InventoryFilter,
  AdjustmentType,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/BadgeCard';
import { Pagination } from '@/components/ui/Pagination';
import { Search, History, SlidersHorizontal, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function AdminInventario() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal de Ajuste
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<AdjustmentType>('INCREASE');
  const [adjustQty, setAdjustQty] = useState<string>('1');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // Modal de Movimientos
  const [movementsItem, setMovementsItem] = useState<InventoryItem | null>(null);
  const [movements, setMovements] = useState<InventoryMovementDTO[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementsTotal, setMovementsTotal] = useState(0);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        filter,
        ...(search ? { search } : {}),
      });

      const data = await fetcher<InventoryListResponse>(
        `/admin/inventory?${queryParams.toString()}`,
        { requireAuth: true }
      );

      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Cargar movimientos de un ítem
  const openMovements = async (item: InventoryItem, p: number = 1) => {
    setMovementsItem(item);
    setMovementsPage(p);
    setLoadingMovements(true);
    try {
      const data = await fetcher<{ movements: InventoryMovementDTO[]; total: number }>(
        `/admin/inventory/${encodeURIComponent(item.id)}/movements?page=${p}&limit=10`,
        { requireAuth: true }
      );
      setMovements(data.movements);
      setMovementsTotal(data.total);
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al cargar movimientos');
    } finally {
      setLoadingMovements(false);
    }
  };

  // Abrir modal de ajuste
  const openAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustType('INCREASE');
    setAdjustQty('1');
    setAdjustReason('');
    setAdjustError('');
  };

  // Aplicar ajuste manual
  const handleApplyAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    const parsedQty = parseInt(adjustQty, 10);
    if (isNaN(parsedQty)) {
      setAdjustError('Ingrese una cantidad válida');
      return;
    }

    if (!adjustReason.trim()) {
      setAdjustError('El motivo del ajuste es obligatorio');
      return;
    }

    setSubmittingAdjust(true);
    setAdjustError('');

    try {
      await fetcher(`/admin/inventory/${encodeURIComponent(adjustingItem.id)}/adjustments`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          type: adjustType,
          quantity: parsedQty,
          reason: adjustReason.trim(),
        }),
      });

      setAdjustingItem(null);
      await loadInventory();
    } catch (err: unknown) {
      setAdjustError((err as Error).message || 'No se pudo aplicar el ajuste');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Cálculo predictivo de nuevo stock en modal
  const calculateProjectedStock = () => {
    if (!adjustingItem) return { projectedStock: 0, projectedAvailable: 0 };
    const qty = parseInt(adjustQty, 10) || 0;
    let newPhysical = adjustingItem.stock;
    if (adjustType === 'INCREASE') newPhysical = adjustingItem.stock + qty;
    else if (adjustType === 'DECREASE') newPhysical = adjustingItem.stock - qty;
    else if (adjustType === 'SET') newPhysical = qty;

    const newAvailable = Math.max(0, newPhysical - adjustingItem.reservedStock);
    return { projectedStock: newPhysical, projectedAvailable: newAvailable };
  };

  const { projectedStock, projectedAvailable } = calculateProjectedStock();
  const willConflict = adjustingItem ? projectedStock < adjustingItem.reservedStock : false;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Inventario por SKU</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Control físico, reservas activas, disponibilidad para venta y trazabilidad de movimientos.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative min-w-[280px] max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por producto, variante o SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar inventario">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'out_of_stock', label: 'Agotados' },
            { id: 'low_stock', label: 'Stock Bajo (≤ 5)' },
            { id: 'has_reserved', label: 'Con Reservas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id as InventoryFilter);
                setPage(1);
              }}
              className={`min-h-10 rounded-lg px-4 text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de existencias */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="p-4 text-neutral-600 font-semibold">SKU</th>
              <th className="p-4 text-neutral-600 font-semibold">Producto / Detalle</th>
              <th className="p-4 text-neutral-600 font-semibold text-center">Físico</th>
              <th className="p-4 text-neutral-600 font-semibold text-center">Reservado</th>
              <th className="p-4 text-neutral-600 font-semibold text-center">Disponible</th>
              <th className="p-4 text-neutral-600 font-semibold">Estado</th>
              <th className="p-4 text-neutral-600 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  Cargando inventario...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  No se encontraron SKU para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/75">
                  <td className="p-4 font-mono font-medium text-neutral-800">{item.sku}</td>
                  <td className="p-4">
                    <div className="font-medium text-primary">{item.productName}</div>
                    {item.variantName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-normal mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {item.variantName}
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-normal">Producto Simple</span>
                    )}
                  </td>
                  <td className="p-4 text-center font-mono text-neutral-700 font-medium">
                    {item.stock}
                  </td>
                  <td className="p-4 text-center font-mono">
                    {item.reservedStock > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200">
                        {item.reservedStock}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-xs">0</span>
                    )}
                  </td>
                  <td className="p-4 text-center font-mono">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs ${
                        item.availableStock <= 0
                          ? 'bg-red-100 text-red-700'
                          : item.availableStock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.availableStock}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={item.status === 'ACTIVE' ? 'success' : 'default'}>
                      {item.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMovements(item)}
                        className="inline-flex items-center gap-1.5 text-xs"
                      >
                        <History className="h-3.5 w-3.5" />
                        Historial
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openAdjust(item)}
                        className="inline-flex items-center gap-1.5 text-xs"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Ajustar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación unificada */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* MODAL DE AJUSTE MANUAL */}
      {adjustingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-primary">Ajuste Manual de Inventario</h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  SKU: {adjustingItem.sku} • {adjustingItem.productName}
                  {adjustingItem.variantName ? ` (${adjustingItem.variantName})` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
                aria-label="Cerrar modal de ajuste"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Saldos actuales */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-xl mb-4 text-center">
              <div>
                <span className="block text-xs text-neutral-500">Físico Actual</span>
                <span className="text-lg font-bold font-mono text-neutral-800">{adjustingItem.stock}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-500">Reservadas</span>
                <span className="text-lg font-bold font-mono text-amber-600">{adjustingItem.reservedStock}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-500">Disponible</span>
                <span className="text-lg font-bold font-mono text-emerald-700">{adjustingItem.availableStock}</span>
              </div>
            </div>

            <form onSubmit={handleApplyAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Operación de Ajuste
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'INCREASE', label: '+ Aumentar' },
                    { id: 'DECREASE', label: '- Disminuir' },
                    { id: 'SET', label: '= Establecer' },
                  ].map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setAdjustType(op.id as AdjustmentType)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border text-center transition-colors ${
                        adjustType === op.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Cantidad
                </label>
                <input
                  type="number"
                  min={adjustType === 'SET' ? 0 : 1}
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Motivo del Ajuste (Obligatorio)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Conteo físico mensual, Merma, Devolución proveedor..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Previsualización del saldo resultante */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  willConflict
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                }`}
              >
                {willConflict ? (
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="font-semibold">Nuevo saldo físico resultante: {projectedStock}</span>
                  <span className="block text-neutral-500 mt-0.5">
                    Disponible proyectado: {projectedAvailable} (Reservadas: {adjustingItem.reservedStock})
                  </span>
                  {willConflict && (
                    <span className="block text-red-700 font-semibold mt-1">
                      No es posible reducir el stock por debajo de las {adjustingItem.reservedStock} unidades reservadas.
                    </span>
                  )}
                </div>
              </div>

              {adjustError && (
                <div role="alert" className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                  {adjustError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustingItem(null)}
                  disabled={submittingAdjust}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submittingAdjust || willConflict}>
                  {submittingAdjust ? 'Aplicando...' : 'Confirmar Ajuste'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL DE MOVIMIENTOS */}
      {movementsItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-neutral-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-xl font-bold text-primary">Historial de Movimientos</h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  SKU: {movementsItem.sku} • {movementsItem.productName}
                  {movementsItem.variantName ? ` (${movementsItem.variantName})` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMovementsItem(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
                aria-label="Cerrar modal de historial"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingMovements ? (
                <div className="text-center py-8 text-neutral-500">Cargando movimientos...</div>
              ) : movements.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  Este SKU aún no tiene movimientos de inventario registrados.
                </div>
              ) : (
                <div className="space-y-3">
                  {movements.map((mov) => (
                    <div
                      key={mov.id}
                      className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-neutral-800">
                          {mov.type === 'AJUSTE_MANUAL' && 'Ajuste Manual'}
                          {mov.type === 'RESERVA_PEDIDO' && 'Reserva de Pedido'}
                          {mov.type === 'SALIDA_PEDIDO' && 'Salida por Despacho'}
                          {mov.type === 'LIBERACION_PEDIDO' && 'Liberación por Cancelación'}
                          {mov.type === 'REPOSICION_PEDIDO' && 'Reposición de Stock'}
                        </span>
                        <span className="text-neutral-400 font-mono text-[11px]">
                          {new Date(mov.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-600 mb-1">
                        <div>
                          <span>Variación física: </span>
                          <strong
                            className={
                              mov.quantityChange > 0
                                ? 'text-emerald-700'
                                : mov.quantityChange < 0
                                ? 'text-red-700'
                                : 'text-neutral-500'
                            }
                          >
                            {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                          </strong>
                          <span className="mx-2">•</span>
                          <span>Variación reserva: </span>
                          <strong
                            className={
                              mov.reservedChange > 0
                                ? 'text-amber-700'
                                : mov.reservedChange < 0
                                ? 'text-blue-700'
                                : 'text-neutral-500'
                            }
                          >
                            {mov.reservedChange > 0 ? `+${mov.reservedChange}` : mov.reservedChange}
                          </strong>
                        </div>
                        <div className="font-mono text-neutral-500">
                          Saldo: <strong>{mov.stockAfter}</strong> (Res: {mov.reservedStockAfter})
                        </div>
                      </div>

                      <div className="text-neutral-500 mt-1 flex items-center justify-between text-[11px]">
                        <span>Motivo/Ref: {mov.reason || 'Sin motivo especificado'}</span>
                        {mov.actor && <span className="text-neutral-400">Actor: {mov.actor}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Total: {movementsTotal} movimientos (Pág. {movementsPage})</span>
              <Button size="sm" variant="outline" onClick={() => setMovementsItem(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
