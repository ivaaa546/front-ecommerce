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
