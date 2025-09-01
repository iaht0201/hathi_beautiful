import Link from "next/link";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { formatVnd } from "@/utils/format";
import { type ProductWithRefs } from "@/types/product";

export const formatDate = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "-";
export const formatBool = (b?: boolean | null) => (b ? "Có" : "Không");

export function renderProductCell(p: ProductWithRefs, key: string) {
  switch (key) {
    case "name":
      return (
        <Link href={`/admin/products/${p.id}/edit`} className="underline">
          {p.name}
        </Link>
      );
    case "slug":
      return p.slug ?? "-";
    case "price":
      return formatVnd(p.price);
    case "compareAtPrice":
      return p.compareAtPrice ? formatVnd(p.compareAtPrice) : "-";
    case "sku":
      return p.sku ?? "-";
    case "stock":
      return typeof p.stock === "number" ? p.stock : "-";
    case "imageUrl":
      return p.imageUrl ? (
        <a
          href={p.imageUrl}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Xem ảnh
        </a>
      ) : (
        "-"
      );
    case "images": {
      const arr = Array.isArray(p.imageUrl) ? p.imageUrl : [];
      if (!arr?.length) return "-";
      const first = typeof arr[0] === "string" ? arr[0] : arr[0]?.url;
      return (
        <div className="flex items-center gap-2">
          {first ? (
            <a
              href={first}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Ảnh 1
            </a>
          ) : null}
          <span className="text-gray-500">({arr.length} ảnh)</span>
        </div>
      );
    }
    case "description":
      return p.description ? (
        <span title={p.description} className="line-clamp-2 max-w-[36ch] block">
          {p.description}
        </span>
      ) : (
        "-"
      );
    case "shortDescription":
      return p.shortDescription ? (
        <span
          title={p.shortDescription}
          className="line-clamp-2 max-w-[36ch] block"
        >
          {p.shortDescription}
        </span>
      ) : (
        "-"
      );
    case "ingredients":
      return p.ingredients ? (
        <span title={p.ingredients} className="line-clamp-2 max-w-[36ch] block">
          {p.ingredients}
        </span>
      ) : (
        "-"
      );
    case "usage":
      return p.usage ? (
        <span title={p.usage} className="line-clamp-2 max-w-[36ch] block">
          {p.usage}
        </span>
      ) : (
        "-"
      );
    case "volume":
      return p.volume ?? "-";
    case "volumeUnit":
      return p.volumeUnit ?? "-";
    case "origin":
      return p.origin ?? "-";
    case "brandName":
      return p.brand?.name ?? "-";
    case "categoryName":
      return p.category?.name ?? "-";
    case "isFeatured":
      return typeof p.isFeatured === "boolean"
        ? formatBool(p.isFeatured)
        : formatBool(Boolean(p.isFeatured));
    case "status":
      return p.status ?? "-";
    case "publishedAt":
      return formatDate(p.publishedAt);
    case "metaTitle":
      return p.metaTitle ?? "-";
    case "metaDescription":
      return p.metaDescription ? (
        <span
          title={p.metaDescription}
          className="line-clamp-2 max-w-[36ch] block"
        >
          {p.metaDescription}
        </span>
      ) : (
        "-"
      );
    case "actions":
      return (
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${p.id}/edit`} className="underline">
            Sửa
          </Link>
          <span className="text-gray-300">·</span>
          <DeleteProductButton id={p.id} />
        </div>
      );
    default:
      return p[key as keyof ProductWithRefs] ?? "-";
  }
}
