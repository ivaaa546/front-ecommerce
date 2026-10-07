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
}

export interface AuthoritativeOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AuthoritativeOrderResponse {
  orderId: string;
  orderNumber: string;
  status: 'PENDIENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGADO';
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

