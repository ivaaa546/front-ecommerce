'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetcher, ApiError } from '@/services/api';
import { trackMetaEvent } from '@/lib/metaPixel';
import { AuthoritativeOrderResponse, Product } from '@/types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart, reconcileItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Costo y configuración de envío vigente (RF-035, RN-010, PA-007)
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado de conciliación de carrito (T-023, RF-034, RN-014, PA-007)
  const [reconciliationNotice, setReconciliationNotice] = useState<string[] | null>(null);
  const [requiresReconfirmation, setRequiresReconfirmation] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    department: '',
    municipality: '',
    exactAddress: '',
    reference: '',
  });

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetcher<{ shipping: { type: string; amount: number | string } }>('/settings');
      const cost = res.shipping.type === 'FREE' ? 0 : Number(res.shipping.amount);
      if (isNaN(cost) || cost < 0) {
        throw new Error('Configuración de envío inválida');
      }
      setShippingCost(cost);
    } catch {
      setSettingsError('No se pudo obtener la tarifa de envío vigente. Por favor reintenta.');
      setShippingCost(null); // No asumir costo supuesto (RF-035)
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadSettings();
  }, [loadSettings]);

  // Si el carrito está vacío en el montaje, redirigir al carrito
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/carrito');
    }
  }, [mounted, items.length, router]);

  // Telemetría InitiateCheckout al estar listos
  useEffect(() => {
    if (items.length > 0 && shippingCost !== null) {
      trackMetaEvent('InitiateCheckout', {
        content_ids: items.map((item) => item.productId),
        num_items: items.length,
        value: getTotal() + shippingCost,
        currency: 'GTQ',
      });
    }
  }, [items, shippingCost, getTotal]);

  if (!mounted) return null;
  if (items.length === 0) return null;

  const subtotal = getTotal();
  const currentShipping = shippingCost ?? 0;
  const total = subtotal + currentShipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Concilia el carrito con los productos y tarifas vigentes en el backend (T-023).
   * Retorna true si todo coincide; false si hubo cambios que requieren reconfirmación.
   */
  const reconcileCartBeforeSubmit = async (): Promise<boolean> => {
    try {
      const idsParam = items.map((i) => i.productId).join(',');
      const [freshProducts, freshSettings] = await Promise.all([
        fetcher<Product[]>(`/products?ids=${idsParam}`),
        fetcher<{ shipping: { type: string; amount: number | string } }>('/settings'),
      ]);
      const freshMap = new Map(freshProducts.map((p) => [p.id, p]));
      const freshShipping = freshSettings.shipping.type === 'FREE' ? 0 : Number(freshSettings.shipping.amount);

      if (isNaN(freshShipping) || freshShipping < 0) {
        throw new Error('Configuración de envío inválida');
      }

      const notices: string[] = [];

      if (shippingCost === null || Math.abs(freshShipping - shippingCost) > 0.001) {
        notices.push(
          `La tarifa de envío vigente cambió de ${shippingCost === null ? 'pendiente' : `Q${shippingCost.toFixed(2)}`} a ${freshShipping === 0 ? 'Gratis' : `Q${freshShipping.toFixed(2)}`}.`
        );
        setShippingCost(freshShipping);
        setSettingsError(null);
      }

      for (const item of items) {
        const fresh = freshMap.get(item.productId);
        if (!fresh || fresh.status !== 'ACTIVE') {
          notices.push(`El producto "${item.name}" ya no está disponible para venta y ha sido retirado del carrito.`);
          continue;
        }

        const freshPrice = typeof fresh.price === 'string' ? parseFloat(fresh.price) : Number(fresh.price);
        if (!isNaN(freshPrice) && Math.abs(freshPrice - item.price) > 0.001) {
          notices.push(`El precio de "${item.name}" cambió de Q${item.price.toFixed(2)} a Q${freshPrice.toFixed(2)}.`);
        }

        if (fresh.stock < item.quantity) {
          if (fresh.stock === 0) {
            notices.push(`El producto "${item.name}" se agotó y no puede comprarse.`);
          } else {
            notices.push(`El stock de "${item.name}" cambió: tu cantidad se ajustó a las ${fresh.stock} unidades disponibles.`);
          }
        }
      }

      if (notices.length > 0) {
        // Actualizar el carrito con los datos vigentes y exigir confirmación explícita del nuevo resumen.
        reconcileItems(freshProducts);
        setReconciliationNotice(notices);
        setRequiresReconfirmation(true);
        return false;
      }

      return true;
    } catch {
      setError('No se pudo validar el carrito con datos vigentes del servidor. Por favor reintenta antes de confirmar.');
      return false;
    }
  };

  const handleAcceptReconciliation = () => {
    setReconciliationNotice(null);
    setRequiresReconfirmation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que tengamos costo de envío real de servidor
    if (shippingCost === null) {
      setError('No es posible confirmar la compra sin la tarifa de envío vigente. Por favor reintenta.');
      return;
    }

    setLoading(true);

    try {
      // Paso 1: Conciliar productos antes de confirmar si no ha sido reconfirmado
      if (!requiresReconfirmation) {
        const isUpToDate = await reconcileCartBeforeSubmit();
        if (!isUpToDate) {
          setLoading(false);
          return;
        }
      }

      // Paso 2: Crear el pedido en el backend
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const payload = {
        customer: {
          fullName,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email ? formData.email.trim() : undefined,
        },
        address: {
          department: formData.department,
          municipality: formData.municipality.trim(),
          exactAddress: formData.exactAddress.trim(),
          reference: formData.reference ? formData.reference.trim() : undefined,
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: 'CASH_ON_DELIVERY',
      };

      const order = await fetcher<AuthoritativeOrderResponse>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // T-024, T-025, T-026: Guardar la respuesta autoritativa antes de vaciar el carrito
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last-confirmed-order', JSON.stringify(order));
      }

      // Vaciar carrito únicamente tras el éxito verificado de la compra
      clearCart();

      // Redirigir a la página de éxito unificada
      router.push(`/checkout/exito?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (err: unknown) {
      setLoading(false);

      if (err instanceof ApiError) {
        if (err.code === 'STOCK_CONFLICT' || err.code === 'PRICE_CONFLICT') {
          setError(`${err.message}. Los datos del carrito han sido actualizados.`);
          // Disparar conciliación automática para refrescar stock/precios
          reconcileCartBeforeSubmit();
        } else {
          setError(err.message || 'Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error de conexión al procesar tu pedido. Por favor intenta de nuevo.');
      }
    }
  };

  const DEPARTAMENTOS_GUATEMALA = [
    'Alta Verapaz',
    'Baja Verapaz',
    'Chimaltenango',
    'Chiquimula',
    'El Progreso',
    'Escuintla',
    'Guatemala',
    'Huehuetenango',
    'Izabal',
    'Jalapa',
    'Jutiapa',
    'Petén',
    'Quetzaltenango',
    'Quiché',
    'Retalhuleu',
    'Sacatepéquez',
    'San Marcos',
    'Santa Rosa',
    'Sololá',
    'Suchitepéquez',
    'Totonicapán',
    'Zacapa',
  ];

  return (
    <div className="store-shell py-10 sm:py-14 relative">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-8">Finalizar compra</h1>

      {/* Aviso de fallo al cargar envío (RF-035) */}
      {settingsError && (
        <div role="alert" className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-800 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{settingsError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadSettings} disabled={settingsLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
            Reintentar
          </Button>
        </div>
      )}

      {/* Modal/Banner de Conciliación de Precios/Stock (T-023, PA-007) */}
      {reconciliationNotice && reconciliationNotice.length > 0 && (
        <div role="alert" className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 text-base">Actualización de resumen de compra</h3>
              <p className="text-blue-800 text-sm mt-1">
                Detectamos cambios recientes en disponibilidad o precios. Por favor confirma el nuevo resumen para continuar:
              </p>
            </div>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-900 mb-5 pl-2">
            {reconciliationNotice.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
          <Button onClick={handleAcceptReconciliation} size="sm">
            Aceptar cambios y continuar con la compra
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        <form id="checkout-form" onSubmit={handleSubmit} className="flex-1 bg-white border border-gray-200 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 text-primary border-b pb-2">Datos personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input
              label="Nombre *"
              name="firstName"
              required
              autoComplete="given-name"
              placeholder="Ej. Juan"
              value={formData.firstName}
              onChange={handleChange}
            />
            <Input
              label="Apellido *"
              name="lastName"
              required
              autoComplete="family-name"
              placeholder="Ej. Pérez"
              value={formData.lastName}
              onChange={handleChange}
            />
            <Input
              label="Teléfono *"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="Ej. 55554444"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="Correo electrónico (opcional)"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="juan@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <h2 className="text-xl font-bold mb-6 text-primary border-b pb-2">Dirección de entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full flex flex-col space-y-1">
              <label htmlFor="checkout-department" className="text-sm font-medium text-gray-700">
                Departamento *
              </label>
              <select
                id="checkout-department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                autoComplete="address-level1"
                className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="">Selecciona un departamento...</option>
                {DEPARTAMENTOS_GUATEMALA.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Municipio *"
              name="municipality"
              required
              autoComplete="address-level2"
              placeholder="Ej. Ciudad de Guatemala, Mixco..."
              value={formData.municipality}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <Input
                label="Dirección exacta *"
                name="exactAddress"
                required
                autoComplete="street-address"
                placeholder="Calle, avenida, número de casa, colonia o zona"
                value={formData.exactAddress}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Referencia o indicaciones (opcional)"
                name="reference"
                placeholder="Frente a parque, portón verde, etc."
                value={formData.reference}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}
        </form>

        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:sticky lg:top-40">
            <h2 className="text-lg font-bold text-primary mb-4">Resumen del Pedido</h2>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 line-clamp-1">{item.name}</span>
                    <span className="text-gray-500">Cant: {item.quantity}</span>
                  </div>
                  <span className="text-gray-800 font-medium">Q {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Q {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>
                  {settingsLoading ? (
                    <span className="text-gray-400">Calculando...</span>
                  ) : shippingCost === null ? (
                    <span className="text-amber-600">Tarifa pendiente</span>
                  ) : shippingCost === 0 ? (
                    'Gratis'
                  ) : (
                    `Q ${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-xl text-primary tabular-nums mt-4 pt-4 border-t border-gray-200">
                <span>Total a Pagar</span>
                <span>Q {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-neutral-50 border border-neutral-200/80 text-neutral-900 text-xs p-3.5 rounded-lg space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-sm">
                  <span>Pago contra entrega garantizado</span>
                </p>
                <p className="text-neutral-800">
                  Pagarás el total exacto en efectivo al recibir tu paquete. Envío de 1 a 3 días hábiles.
                </p>
              </div>

              <Button
                form="checkout-form"
                type="submit"
                size="lg"
                fullWidth
                disabled={loading || settingsLoading || shippingCost === null || requiresReconfirmation}
              >
                {loading
                  ? 'Procesando pedido...'
                  : requiresReconfirmation
                  ? 'Revisa los cambios arriba'
                  : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
