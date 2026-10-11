import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  variantName?: string;
  sku?: string;
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
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  reconcileItems: (freshProducts: Array<{
    id: string;
    name: string;
    price: string | number;
    stock: number;
    imageUrl: string;
    status: string;
    slug?: string;
    variants?: Array<{
      id: string;
      name: string;
      price: string | number;
      stock: number;
      images?: string[];
      status: string;
      sku?: string;
    }>;
  }>) => void;
}

const getItemKey = (item: { productId: string; variantId?: string }) =>
  item.variantId ? `${item.productId}-${item.variantId}` : item.productId;

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
          const targetKey = getItemKey(newItem);
          const existingItem = state.items.find((i) => getItemKey(i) === targetKey);
          if (existingItem) {
            // T-022, RN-002: Actualiza precio, stock e imagen vigentes y suma cantidad sin superar stock
            const newQuantity = Math.min(existingItem.quantity + newItem.quantity, newItem.stock);
            return {
              isOpen: true,
              items: state.items.map((i) =>
                getItemKey(i) === targetKey
                  ? {
                      ...i,
                      name: newItem.name,
                      variantName: newItem.variantName ?? i.variantName,
                      sku: newItem.sku ?? i.sku,
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
          const targetKey = getItemKey(newItem);
          const existingItem = state.items.find((i) => getItemKey(i) === targetKey);
          if (existingItem) {
            const newQuantity = Math.min(Math.max(1, newItem.quantity), newItem.stock);
            return {
              items: state.items.map((i) =>
                getItemKey(i) === targetKey
                  ? {
                      ...i,
                      name: newItem.name,
                      variantName: newItem.variantName ?? i.variantName,
                      sku: newItem.sku ?? i.sku,
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

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter((i) => {
            if (variantId !== undefined) {
              return !(i.productId === productId && i.variantId === variantId);
            }
            const key = getItemKey(i);
            if (key === productId) return false;
            if (!i.variantId && i.productId === productId) return false;
            return true;
          }),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        set((state) => ({
          items: state.items.map((i) => {
            const isMatch = variantId !== undefined
              ? i.productId === productId && i.variantId === variantId
              : (getItemKey(i) === productId || (!i.variantId && i.productId === productId));

            if (isMatch) {
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
              if (!fresh || fresh.status !== 'ACTIVE') return false;

              if (item.variantId) {
                const variant = fresh.variants?.find((v) => v.id === item.variantId);
                return variant && variant.status === 'ACTIVE' && variant.stock > 0;
              }

              return fresh.stock > 0;
            })
            .map((item) => {
              const fresh = freshMap.get(item.productId)!;

              if (item.variantId) {
                const variant = fresh.variants!.find((v) => v.id === item.variantId)!;
                const vPrice = typeof variant.price === 'string' ? parseFloat(variant.price) : Number(variant.price);
                const vImage = variant.images && variant.images.length > 0 ? variant.images[0] : fresh.imageUrl;

                return {
                  ...item,
                  name: fresh.name,
                  variantName: variant.name,
                  sku: variant.sku ?? item.sku,
                  price: isNaN(vPrice) ? item.price : vPrice,
                  stock: variant.stock,
                  imageUrl: vImage,
                  slug: fresh.slug ?? item.slug,
                  quantity: Math.min(item.quantity, variant.stock),
                };
              }

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
