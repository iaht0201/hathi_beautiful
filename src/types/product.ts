import type { Brand, Category, Product } from "@prisma/client";

export type ProductWithRefs = Product & {
  brand: Brand | null;
  category: Category | null;
};

export type ProductInput = {
  name: string;
  slug: string;
  price: number;
  sku?: string | null;
  stock?: number;
  imageUrl?: string | null;
  description?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
};

export type Option = { id: string; name: string };
