import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { type ProductWithRefs } from "@/types/product";
import DragScrollX from "@/components/ui/drag-scroll-x";
import {
  DEFAULT_COLUMN_KEYS,
  headerLabels,
} from "@/features/products/import/shared";
import { renderProductCell } from "@/features/products/table/renderProductCell";
import React, { isValidElement } from "react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

const pageSize = 10;

async function getData(
  q?: string,
  page = 1
): Promise<{ items: ProductWithRefs[]; total: number; page: number }> {
  const where = q
    ? { name: { contains: q, mode: "insensitive" as const } }
    : undefined;
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { items, total, page };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams; // ✅ await trước khi dùng
  const pageNum = Number(pageStr ?? "1");
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const { items, total } = await getData(q, page);
  const lastPage = Math.max(1, Math.ceil(total / pageSize)); // ✅ dùng pageSize

  const link = (p: number) =>
    `/admin/products?${new URLSearchParams({
      ...(q ? { q } : {}),
      page: String(p),
    }).toString()}`;
  const columnKeys = DEFAULT_COLUMN_KEYS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sản phẩm</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            + Thêm
          </Link>
          <Link
            href="/admin/products/import"
            className="px-3 py-2 rounded border"
          >
            Import CSV/Excel
          </Link>
        </div>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm tên..."
          className="border p-2 rounded w-full"
        />
        <button className="border px-3 rounded">Tìm</button>
      </form>

      <DragScrollX className="overflow-x-auto">
        <table className="w-[3500px] text-sm">
          <thead>
            <tr>
              {columnKeys.map((h, id) => (
                <th
                  key={h}
                  className={`p-2 text-left border-b ${
                    id === 0 ? "sticky left-0 bg-gray-50 z-10 w-[200px]" : ""
                  }`}
                >
                  {headerLabels[h as keyof typeof headerLabels] ?? String(h)}
                </th>
              ))}
              <th
                key={"__actions"}
                className={`p-2 text-left border-b ${"sticky right-0 bg-gray-50 z-10"}`}
              >
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b">
                {columnKeys.map((key, idx) => (
                  <td
                    key={key}
                    className={`p-2 align-top ${
                      idx === 0 ? "sticky left-0 bg-white z-10" : ""
                    }`}
                  >
                    {(() => {
                      const cell = renderProductCell(p, key);
                      if (cell instanceof Date) {
                        return cell.toLocaleString();
                      }
                      if (
                        typeof cell === "object" &&
                        cell !== null &&
                        !React.isValidElement(cell)
                      ) {
                        return JSON.stringify(cell);
                      }
                      return cell;
                    })()}
                  </td>
                ))}
                <td
                  className={`p-2 align-top ${"sticky right-0 bg-white z-10"}`}
                >
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-blue-600"
                  >
                    Chỉnh sửa
                  </Link>

                  <span className="mx-2">·</span>

                  <DeleteProductButton id={p.id} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={columnKeys.length}
                  className="p-6 text-center text-gray-500"
                >
                  Chưa có sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DragScrollX>

      <div className="flex items-center justify-center gap-3">
        <a
          className={`border px-3 py-1 rounded ${
            page <= 1 ? "pointer-events-none opacity-50" : ""
          }`}
          href={link(Math.max(1, page - 1))}
        >
          ← Trước
        </a>
        <span>
          {page} / {lastPage}
        </span>
        <a
          className={`border px-3 py-1 rounded ${
            page >= lastPage ? "pointer-events-none opacity-50" : ""
          }`}
          href={link(Math.min(lastPage, page + 1))}
        >
          Sau →
        </a>
      </div>
    </div>
  );
}
