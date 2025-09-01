// src/app/admin/products/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import ProductForm, {
  type ProductFormValues,
} from "@/components/admin/ProductForm";

type Params = { params: { id: string } };

async function getItem(
  id: string
): Promise<(ProductFormValues & { id: string }) | null> {
  const item = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    sku: item.sku ?? undefined,
    price: item.price,
    compareAtPrice: item.compareAtPrice ?? undefined,
    stock: item.stock,
    imageUrl: item.imageUrl ?? undefined,
    images: (item.images ?? []).map((img) => img.url),
    shortDescription: item.shortDescription ?? undefined,
    description: item.description ?? undefined,
    ingredients: item.ingredients ?? undefined,
    usage: item.usage ?? undefined,
    volume: item.volume ?? undefined,
    volumeUnit: item.volumeUnit ?? undefined,
    origin: item.origin ?? undefined,
    isFeatured: item.isFeatured,
    status: item.status,
    publishedAt: item.publishedAt?.toISOString() ?? undefined,
    metaTitle: item.metaTitle ?? undefined,
    metaDescription: item.metaDescription ?? undefined,
    brandId: item.brandId ?? undefined,
    categoryId: item.categoryId ?? undefined,
  } as ProductFormValues & { id: string };
  // const {
  //   name,
  //   slug,
  //   price,
  //   sku,
  //   stock,
  //   imageUrl,
  //   description,
  //   brandId,
  //   categoryId,

  // } = item;
  // return {
  //   id,
  //   name,
  //   slug,
  //   price,
  //   sku: sku ?? undefined,
  //   stock,
  //   status: item.status, // Ensure status is included
  //   compareAtPrice: item.compareAtPrice ?? undefined, // Optional: include if your form expects it
  //   imageUrl: imageUrl ?? undefined,
  //   description: description ?? undefined,
  //   brandId: brandId ?? undefined,
  //   categoryId: categoryId ?? undefined,
  // };
}

export default async function EditProductPage({ params }: Params) {
  const item = await getItem(params.id);
  if (!item) return <div className="p-6">Không tìm thấy sản phẩm</div>;

  return (
    <div className="max-w">
      <h1 className="text-2xl font-semibold mb-4">Sửa sản phẩm</h1>
      <ProductForm mode="edit" initialData={item} />
    </div>
  );
}
