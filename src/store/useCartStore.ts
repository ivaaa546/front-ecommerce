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
            // Verifica que no supere el stock
            const newQuantity = Math.min(existingItem.quantity + newItem.quantity, newItem.stock);
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.productId === newItem.productId ? { ...i, quantity: newQuantity } : i
              ),
            };
          }
          return { isOpen: true, items: [...state.items, newItem] };
        });
      },

      setItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === newItem.productId);
          if (existingItem) {
            const newQuantity = Math.min(Math.max(1, newItem.quantity), newItem.stock);
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId ? { ...i, quantity: newQuantity } : i
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
              return { ...i, quantity: Math.max(1, quantity) };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'ecommerce-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
