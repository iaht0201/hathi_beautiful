import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DragScrollX from "@/components/ui/drag-scroll-x";

function fmtDate(d?: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN");
}

function getPrimaryImage(
  images: {
    imageUrl: string;
    alt: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }[]
): { imageUrl: string; alt: string } | null {
  if (images.length === 0) return null;
  const primary = images.find((i) => i.isPrimary);
  const chosen = primary ?? images[0];
  return { imageUrl: chosen.imageUrl, alt: chosen.alt ?? "" };
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { products: true } },
      images: {
        select: {
          imageUrl: true,
          alt: true,
          isPrimary: true,
          sortOrder: true,
        },
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { imageUrl: "asc" },
        ],
      },
    },
  });

  return (
    <div className="grid grid-cols-1 gap-6 w-full">
      <div className="col-span-1 items-center justify-around">
        <header className="flex items-center mb-4">
          <div className="flex flex-row justify-between w-full">
            <h1 className="text-xl font-semibold">Categories</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/categories/new"
                className="px-4 py-2 rounded-lg bg-black text-white"
              >
                + Thêm
              </Link>
            </div>
          </div>
        </header>

        <div className="border rounded">
          <DragScrollX className="overflow-x-auto">
            <table className="w-full text-sm table-auto min-w-[1800px]">
              <thead className="bg-gray-50">
                <tr className="text-center">
                  <th className="p-2 w-12">#</th>
                  <th className="p-2 sticky left-0 bg-gray-50">Tên</th>
                  <th className="p-2">Slug</th>
                  <th className="p-2 w-[120px]">Sản phẩm</th>
                  <th className="p-2 w-40">Ảnh chính</th>
                  <th className="p-2 w-[420px]">Gallery</th>
                  <th className="p-2">Ngày tạo</th>
                  <th className="p-2">Đã cập nhật</th>
                  <th className="p-2 sticky right-0 bg-white z-10">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="text-center">
                {categories.map((c, idx) => {
                  const primary = getPrimaryImage(c.images);
                  return (
                    <tr key={c.id} className="border-t align-top">
                      <td className="p-2">{idx + 1}</td>

                      <td className="p-2 sticky left-0 bg-white z-10 text-left">
                        <div className="font-medium">{c.name}</div>
                      </td>

                      <td className="p-2">
                        <code className="px-2 py-1 rounded bg-gray-100">
                          {c.slug}
                        </code>
                      </td>

                      <td className="p-2">{c._count.products}</td>

                      {/* Ảnh chính */}
                      <td className="p-2">
                        {primary ? (
                          <a
                            href={primary.imageUrl}
                            target="_blank"
                            className="group inline-block"
                          >
                            <div className="relative w-28 aspect-[4/4] overflow-hidden rounded border bg-gray-50">
                              <Image
                                src={primary.imageUrl}
                                alt={primary.alt || "primary"}
                                fill
                                sizes="112px"
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Gallery thumbnails */}
                      <td className="p-2">
                        {c.images.length > 0 ? (
                          <div className="flex gap-2 overflow-x-auto">
                            {c.images.map((img, i) => (
                              <a
                                href={img.imageUrl}
                                target="_blank"
                                key={`${img.imageUrl}-${i}`}
                                className="group inline-block"
                                title={img.alt ?? ""}
                              >
                                <div
                                  className={`relative w-24 aspect-[4/4] overflow-hidden rounded border bg-gray-50 ${
                                    img.isPrimary ? "ring-2 ring-blue-500" : ""
                                  }`}
                                >
                                  <Image
                                    src={img.imageUrl}
                                    alt={img.alt ?? `image-${i + 1}`}
                                    fill
                                    sizes="96px"
                                    className="object-cover transition-transform group-hover:scale-105"
                                  />
                                </div>
                              </a>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="p-2">{fmtDate(c.createdAt)}</td>
                      <td className="p-2">{fmtDate(c.updatedAt)}</td>

                      <td className="p-2 sticky right-0 bg-white z-10">
                        <Link
                          href={`/admin/categories/${c.id}/edit`}
                          className="text-blue-600 hover:underline"
                        >
                          Chỉnh sửa
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {categories.length === 0 && (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={9}>
                      Chưa có category nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DragScrollX>
        </div>
      </div>
    </div>
  );
}
