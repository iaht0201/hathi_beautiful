"use client";

import Image from "next/image";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  imageAlt?: string;
  description?: string;
};

export default function CategoryRow({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl font-semibold mb-4">Danh mục sản phẩm</h2>

      {/* Scroll container */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="min-w-[220px] snap-start rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={c.image}
                alt={c.imageAlt || c.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold">{c.name}</h3>
              {c.description && (
                <p className="mt-1 text-xs text-zinc-600 line-clamp-2">
                  {c.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
