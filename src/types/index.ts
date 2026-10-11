export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  parentId?: string | null;
  parent?: Category;
  subCategories?: Category[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: string | number;
  stock: number;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string; // Prisma Decimal returns as string by default, we can parse it
  previousPrice?: string;
  stock: number;
  sku: string;
  imageUrl: string;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE';
  featured: boolean;
  categoryId: string;
  category?: Partial<Category>;
  variants?: ProductVariant[];
}

export interface AuthoritativeOrderItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type OrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'PREPARANDO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'DEVUELTO';

export interface AuthoritativeOrderResponse {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  items: AuthoritativeOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: 'GTQ';
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  createdAt: string;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  returnedAt?: string | null;
  returnReason?: string | null;
  returnedBy?: string | null;
  stockRestored?: boolean;
}

export interface PriceConflictDetails {
  previousSubtotal?: number;
  currentSubtotal: number;
  previousShipping?: number;
  currentShipping: number;
  previousTotal?: number;
  currentTotal: number;
  changedItems: Array<{
    productId: string;
    productName: string;
    previousPrice?: number;
    currentPrice: number;
  }>;
}

export interface StockConflictDetails {
  unavailableItems: Array<{
    productId: string;
    productName?: string;
    requestedQuantity: number;
    availableStock: number;
  }>;
}

