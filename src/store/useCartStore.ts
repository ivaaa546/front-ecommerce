import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  setItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  reconcileItems: (freshProducts: Array<{ id: string; name: string; price: string | number; stock: number; imageUrl: string; status: string; slug?: string }>) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === newItem.productId);
          if (existingItem) {
            // T-022, RN-002: Actualiza precio, stock e imagen vigentes y suma cantidad sin superar stock
            const newQuantity = Math.min(existingItem.quantity + newItem.quantity, newItem.stock);
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.productId === newItem.productId
                  ? {
                      ...i,
                      name: newItem.name,
                      price: newItem.price,
                      stock: newItem.stock,
                      imageUrl: newItem.imageUrl,
                      slug: newItem.slug ?? i.slug,
                      quantity: newQuantity,
                    }
                  : i
              ),
            };
          }
          const validQuantity = Math.min(newItem.quantity, newItem.stock);
          return { isOpen: true, items: [...state.items, { ...newItem, quantity: validQuantity }] };
        });
      },

      setItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === newItem.productId);
          if (existingItem) {
            const newQuantity = Math.min(Math.max(1, newItem.quantity), newItem.stock);
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId
                  ? {
                      ...i,
                      name: newItem.name,
                      price: newItem.price,
                      stock: newItem.stock,
                      imageUrl: newItem.imageUrl,
                      slug: newItem.slug ?? i.slug,
                      quantity: newQuantity,
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId === productId) {
              // T-022: Incrementar no supera el stock conocido
              const boundedQuantity = Math.min(Math.max(1, quantity), i.stock);
              return { ...i, quantity: boundedQuantity };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const raw = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return Math.round(raw * 100) / 100;
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      reconcileItems: (freshProducts) => {
        const freshMap = new Map(freshProducts.map((p) => [p.id, p]));
        set((state) => ({
          items: state.items
            .filter((item) => {
              const fresh = freshMap.get(item.productId);
              return fresh && fresh.status === 'ACTIVE' && fresh.stock > 0;
            })
            .map((item) => {
              const fresh = freshMap.get(item.productId)!;
              const numericPrice = typeof fresh.price === 'string' ? parseFloat(fresh.price) : Number(fresh.price);
              return {
                ...item,
                name: fresh.name,
                price: isNaN(numericPrice) ? item.price : numericPrice,
                stock: fresh.stock,
                imageUrl: fresh.imageUrl,
                slug: fresh.slug ?? item.slug,
                quantity: Math.min(item.quantity, fresh.stock),
              };
            }),
        }));
      },
    }),
    {
      name: 'ecommerce-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
