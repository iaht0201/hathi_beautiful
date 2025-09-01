"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DragScrollX from "@/components/ui/drag-scroll-x";
import { makeProductSeo } from "@/utils/seo";
import {
  ImportRow,
  headerLabels,
  DEFAULT_COLUMN_KEYS,
} from "@/features/products/import/shared";

/** Trạng thái tiếng Việt cho UI */
const STATUS_LABELS_VN: Record<NonNullable<ImportRow["status"]>, string> = {
  PUBLISHED: "ĐANG BÁN",
  DRAFT: "NHÁP",
  ARCHIVED: "NGỪNG BÁN",
};

function parseTagsInput(s: string): string[] {
  return s
    .split(/[|,;]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}
function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** Tự gen SEO nếu đang trống (không ghi đè nếu user đã nhập tay) */
function fillSeoIfEmpty(r: ImportRow): ImportRow {
  const needTitle = !r.metaTitle || !r.metaTitle.trim();
  const needDesc = !r.metaDescription || !r.metaDescription.trim();
  if (!needTitle && !needDesc) return r;

  const gen = makeProductSeo({
    name: r.name,
    brandName: r.brandName ?? undefined,
    categoryName: r.categoryName ?? undefined,
    volume: r.volume ?? undefined,
    shortDescription: r.shortDescription ?? undefined,
    description: r.description ?? undefined,
  });

  return {
    ...r,
    metaTitle: needTitle ? gen.metaTitle : r.metaTitle,
    metaDescription: needDesc ? gen.metaDescription : r.metaDescription,
  };
}

export default function ImportProductsPage() {
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(true);
  const router = useRouter();

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/products/import/preview", {
      method: "POST",
      body: fd,
    });
    setLoading(false);
    if (!res.ok) {
      const msg = await res.text();
      alert("Lỗi đọc file: " + msg);
      return;
    }
    const data = (await res.json()) as { rows: ImportRow[] };

    // After upload: set publishedAt nếu thiếu + gen SEO nếu trống
    const nowISO = new Date().toISOString();
    const withDefaults = data.rows.map((r) => {
      const publishedAt = r.publishedAt ?? nowISO;
      return fillSeoIfEmpty({ ...r, publishedAt });
    });

    setRows(withDefaults);
  }

  function editCell(i: number, key: keyof ImportRow, value: string | boolean) {
    setRows((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      let r: ImportRow = { ...next[i] };

      switch (key) {
        case "price": {
          const newPrice = Number(value || 0);
          r.price = newPrice;
          break;
        }
        case "stock":
          r.stock = Number(value || 0);
          break;
        case "compareAtPrice": {
          const v = String(value);
          r.compareAtPrice = v === "" ? r.price : Number(v || 0);
          break;
        }
        case "name":
        case "volume":
        case "volumeUnit":
        case "origin":
        case "metaTitle":
          r[key] = String(value);
          break;
        case "sku":
        case "imageUrl":
        case "shortDescription":
        case "ingredients":
        case "usage":
        case "description":
        case "brandName":
        case "categoryName":
        case "metaDescription": {
          const v = String(value).trim();
          (r as Record<string, unknown>)[key] = v ? v : null;
          break;
        }
        // case "tags":
        //   r.tags = parseTagsInput(String(value));
        //   break;
        case "isFeatured":
          r.isFeatured = Boolean(value);
          break;
        case "status": {
          const v = String(value).toUpperCase();
          r.status =
            v === "DRAFT" || v === "ARCHIVED"
              ? (v as ImportRow["status"])
              : "PUBLISHED";
          break;
        }
        case "publishedAt": {
          const s = String(value);
          r.publishedAt = s
            ? new Date(s).toISOString()
            : new Date().toISOString();
          break;
        }
        // không edit trực tiếp
        case "__errors":
        case "__newBrand":
        case "__newCategory":
        // case "images":
        //   break;
        case "slug":
          // nếu muốn cho sửa slug thủ công thì mở khóa chỗ này
          // r.slug = String(value);
          break;
      }

      // Nếu user sửa các trường ảnh hưởng SEO → auto fill nếu meta đang TRỐNG
      const seoRelated: (keyof ImportRow)[] = [
        "name",
        "brandName",
        "categoryName",
        "volume",
        "shortDescription",
        "description",
      ];
      if (seoRelated.includes(key)) r = fillSeoIfEmpty(r);

      next[i] = r;
      return next;
    });
  }

  async function handleCommit() {
    if (!rows?.length) return;
    setSaving(true);
    const res = await fetch("/api/products/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, updateExisting }),
    });
    setSaving(false);
    if (!res.ok) {
      const msg = await res.text();
      alert("Lỗi lưu: " + msg);
      return;
    }
    const result = (await res.json()) as {
      created: number;
      updated: number;
      skipped: number;
    };
    alert(
      `Xong! Tạo mới: ${result.created}, Cập nhật: ${result.updated}, Bỏ qua: ${result.skipped}`
    );
    router.push("/admin/products");
  }

  const invalidCount = useMemo(
    () =>
      rows?.filter(
        (r) =>
          (r.__errors?.length ?? 0) > 0 ||
          !r.name ||
          !r.slug ||
          !Number.isFinite(r.price) ||
          r.price < 0
      ).length ?? 0,
    [rows]
  );

  const columnKeys = DEFAULT_COLUMN_KEYS;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Import sản phẩm (CSV/Excel)</h1>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleUploadFile}
        />
        {loading && (
          <span className="text-sm text-gray-500">Đang đọc file…</span>
        )}
      </div>

      {!rows && (
        <p className="text-sm text-gray-600">
          Cột hỗ trợ:&nbsp;
          <code className="whitespace-pre-wrap">
            {Object.values(headerLabels).join(", ")}
          </code>
          .
        </p>
      )}

      {rows && (
        <>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
              />
              Cập nhật nếu trùng <b>tên</b> (tên là duy nhất)
            </label>
            <div className="text-sm">
              Tổng: <b>{rows.length}</b>{" "}
              {invalidCount > 0 && (
                <span className="text-red-600">• Lỗi: {invalidCount}</span>
              )}
            </div>
          </div>

          <DragScrollX className="overflow-x-auto">
            <table className="w-[1800px] text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  {columnKeys.map((h, id) => (
                    <th
                      key={h}
                      className={`p-2 text-left border-b ${
                        id === 0 ? "sticky left-0 bg-gray-50 z-10" : ""
                      }`}
                    >
                      {headerLabels[h as keyof typeof headerLabels] ??
                        String(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const bad =
                    (r.__errors?.length ?? 0) > 0 ||
                    !r.name ||
                    !r.slug ||
                    !Number.isFinite(r.price) ||
                    r.price < 0;
                  const cellCls = "border p-1 rounded";
                  const stickyCellBg = bad ? "bg-red-50" : "bg-white";
                  return (
                    <tr key={i} className={bad ? "bg-red-50" : ""}>
                      {/* Tên */}
                      <td
                        className={`p-2 border-b sticky left-0 z-10 ${stickyCellBg}`}
                      >
                        <input
                          className={`${cellCls} w-56`}
                          value={r.name}
                          onChange={(e) => editCell(i, "name", e.target.value)}
                        />
                        {(r.__newBrand || r.__newCategory) && (
                          <div className="text-[11px] text-amber-700 mt-1">
                            {r.__newBrand && (
                              <span>• Sẽ tạo Thương hiệu mới&nbsp;</span>
                            )}
                            {r.__newCategory && (
                              <span>• Sẽ tạo Danh mục mới</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Giá bán */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-28`}
                          type="number"
                          value={r.price ?? 0}
                          onChange={(e) => editCell(i, "price", e.target.value)}
                        />
                      </td>

                      {/* Giá cũ */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-28`}
                          type="number"
                          value={r.compareAtPrice ?? ""}
                          onChange={(e) =>
                            editCell(i, "compareAtPrice", e.target.value)
                          }
                        />
                      </td>

                      {/* SKU */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-36`}
                          value={r.sku ?? ""}
                          onChange={(e) => editCell(i, "sku", e.target.value)}
                        />
                      </td>

                      {/* Tồn kho */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-24`}
                          type="number"
                          value={r.stock ?? 0}
                          onChange={(e) => editCell(i, "stock", e.target.value)}
                        />
                      </td>

                      {/* Thương hiệu */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-40`}
                          value={r.brandName ?? ""}
                          onChange={(e) =>
                            editCell(i, "brandName", e.target.value)
                          }
                        />
                      </td>

                      {/* Danh mục */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-40`}
                          value={r.categoryName ?? ""}
                          onChange={(e) =>
                            editCell(i, "categoryName", e.target.value)
                          }
                        />
                      </td>

                      {/* Ảnh đại diện */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-64`}
                          value={r.imageUrl ?? ""}
                          onChange={(e) =>
                            editCell(i, "imageUrl", e.target.value)
                          }
                        />
                      </td>

                      {/* Mô tả ngắn */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-72`}
                          value={r.shortDescription ?? ""}
                          onChange={(e) =>
                            editCell(i, "shortDescription", e.target.value)
                          }
                        />
                      </td>

                      {/* Mô tả chi tiết */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-[24rem]`}
                          value={r.description ?? ""}
                          onChange={(e) =>
                            editCell(i, "description", e.target.value)
                          }
                        />
                      </td>

                      {/* Thành phần */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-56`}
                          value={r.ingredients ?? ""}
                          onChange={(e) =>
                            editCell(i, "ingredients", e.target.value)
                          }
                        />
                      </td>

                      {/* Hướng dẫn sử dụng */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-56`}
                          value={r.usage ?? ""}
                          onChange={(e) => editCell(i, "usage", e.target.value)}
                        />
                      </td>

                      {/* Dung tích */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-32`}
                          value={r.volume ?? ""}
                          onChange={(e) =>
                            editCell(i, "volume", e.target.value)
                          }
                        />
                      </td>

                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-32`}
                          value={r.volumeUnit ?? ""}
                          onChange={(e) =>
                            editCell(i, "volumeUnit", e.target.value)
                          }
                        />
                      </td>

                      {/* Xuất xứ */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-40`}
                          value={r.origin ?? ""}
                          onChange={(e) =>
                            editCell(i, "origin", e.target.value)
                          }
                        />
                      </td>

                      {/* Tags */}
                      {/* <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-64`}
                          placeholder="tag1, tag2"
                          value={(r.tags ?? []).join(", ")}
                          onChange={(e) => editCell(i, "tags", e.target.value)}
                        />
                      </td> */}

                      {/* Nổi bật */}
                      <td className="p-2 border-b">
                        <input
                          type="checkbox"
                          className="scale-110"
                          checked={Boolean(r.isFeatured)}
                          onChange={(e) =>
                            editCell(i, "isFeatured", e.target.checked)
                          }
                        />
                      </td>

                      {/* Trạng thái */}
                      <td className="p-2 border-b">
                        <select
                          className={`${cellCls}`}
                          value={r.status ?? "PUBLISHED"}
                          onChange={(e) =>
                            editCell(i, "status", e.target.value)
                          }
                        >
                          <option value="PUBLISHED">
                            {STATUS_LABELS_VN.PUBLISHED}
                          </option>
                          <option value="DRAFT">
                            {STATUS_LABELS_VN.DRAFT}
                          </option>
                          <option value="ARCHIVED">
                            {STATUS_LABELS_VN.ARCHIVED}
                          </option>
                        </select>
                      </td>

                      {/* Ngày đăng bán */}
                      <td className="p-2 border-b">
                        <input
                          type="datetime-local"
                          className={`${cellCls}`}
                          value={toDatetimeLocalValue(
                            r.publishedAt ?? new Date().toISOString()
                          )}
                          onChange={(e) =>
                            editCell(i, "publishedAt", e.target.value)
                          }
                        />
                      </td>

                      {/* SEO Title */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-72`}
                          value={r.metaTitle ?? ""}
                          onChange={(e) =>
                            editCell(i, "metaTitle", e.target.value)
                          }
                        />
                      </td>

                      {/* SEO Description */}
                      <td className="p-2 border-b">
                        <input
                          className={`${cellCls} w-[24rem]`}
                          value={r.metaDescription ?? ""}
                          onChange={(e) =>
                            editCell(i, "metaDescription", e.target.value)
                          }
                        />
                      </td>

                      {/* Lỗi */}
                      <td className="p-2 border-b text-xs text-red-600 align-top">
                        {r.__errors?.length ? r.__errors.join(", ") : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DragScrollX>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
              disabled={saving || invalidCount > 0}
              onClick={handleCommit}
            >
              {saving ? "Đang lưu…" : "Lưu vào DB"}
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setRows(null)}
            >
              Huỷ/Chọn file khác
            </button>
          </div>
        </>
      )}
    </div>
  );
}
