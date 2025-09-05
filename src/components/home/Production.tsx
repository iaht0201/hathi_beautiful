"use client";

import Image from "next/image";
import Link from "next/link";

type ProductImage = { url: string; alt?: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  images?: ProductImage[];
  shortDescription?: string | null;
};

export default function ProductRow({
  products,
  title = "Sản phẩm nổi bật",
}: {
  products: Product[];
  title?: string;
}) {
  // JSON-LD ItemList (SEO)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: products.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `/san-pham/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <section aria-labelledby="row-title" className="px-4 sm:px-6 lg:px-8 py-8">
      <h2 id="row-title" className="text-xl font-semibold mb-4">
        {title}
      </h2>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        role="list"
      >
        {products.map((p) => {
          const cover =
            p.imageUrl ||
            p.images?.[0]?.url ||
            "https://picsum.photos/seed/placeholder/800/600";
          return (
            <Link
              key={p.id}
              href={`/san-pham/${p.slug}`}
              role="listitem"
              className="min-w-[240px] snap-start rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={cover}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
                  priority={false}
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold line-clamp-2">{p.name}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-semibold">
                    {p.price.toLocaleString("vi-VN")}₫
                  </span>
                  {p.compareAtPrice && (
                    <span className="text-xs text-zinc-500 line-through">
                      {p.compareAtPrice.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>
                {p.shortDescription && (
                  <p className="mt-1 text-xs text-zinc-600 line-clamp-2">
                    {p.shortDescription}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
