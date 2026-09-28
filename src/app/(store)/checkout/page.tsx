'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/services/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [shippingCost, setShippingCost] = useState(30); // Default, luego se actualiza
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    setMounted(true);
    if (items.length > 0) {
      // Obtener settings para el costo de envío
      fetcher<{ shipping: { type: string; amount: string } }>('/settings')
        .then((res) => {
          setShippingCost(res.shipping.type === 'FREE' ? 0 : parseFloat(res.shipping.amount));
        })
        .catch((err) => console.error('Error cargando settings:', err));
    }
  }, [items.length]);

  if (!mounted) return null;

  if (items.length === 0) {
    router.push('/carrito');
    return null;
  }

  const subtotal = getTotal();
  const total = subtotal + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: 'CASH_ON_DELIVERY',
      };

      const response = await fetcher<{ orderNumber: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      clearCart();
      router.push(`/checkout/exito?order=${response.orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
      setLoading(false);
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        <form id="checkout-form" onSubmit={handleSubmit} className="flex-1 bg-white border border-gray-200 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 text-primary border-b pb-2">1. Datos Personales</h2>
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

          <h2 className="text-xl font-bold mb-6 text-primary border-b pb-2">2. Dirección de Entrega</h2>
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
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-bold text-primary mb-4">Resumen del Pedido</h2>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
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
                <span>{shippingCost === 0 ? 'Gratis' : `Q ${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-primary mt-4 pt-4 border-t border-gray-200">
                <span>Total a Pagar</span>
                <span>Q {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 text-amber-900 text-xs p-3.5 rounded-lg space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-sm">
                  <span>Pago contra entrega garantizado</span>
                </p>
                <p className="text-amber-800">
                  Pagarás el total exacto en efectivo al recibir tu paquete. El repartidor te contactará antes de la entrega.
                </p>
              </div>

              <Button
                form="checkout-form"
                type="submit"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Procesando pedido...' : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
