// src/features/products/import/shared.ts
export type ImageItem = {
  url: string;
  alt?: string | null;
  position?: number;
};

export type ImportRow = {
  // bắt buộc / chính
  name: string;
  slug: string;
  price: number;
  sku: string | null;
  stock: number;
  imageUrl: string | null;
  description: string | null;
  brandName: string | null;
  categoryName: string | null;

  // mở rộng
  compareAtPrice: number | null;
  shortDescription: string | null;
  ingredients: string | null;
  usage: string | null;
  volume: string | null;
  volumeUnit: string | null;
  origin: string | null;
  //   tags?: string[];
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null; // ISO
  metaTitle: string | null;
  metaDescription: string | null;

  // images: ImageItem[];

  // gợi ý tạo mới
  __newBrand?: boolean;
  __newCategory?: boolean;

  // lỗi phát hiện sớm (preview)
  __errors?: string[];
};

/* --------------------------- helpers parse --------------------------- */
export function norm(v: unknown): string {
  if (Array.isArray(v)) v = v.map((x) => String(x ?? "")).join(" ");
  const t = String(v ?? "")
    .replace(/\uFEFF/g, "") // BOM
    .replace(/[\u200B-\u200D\u2060]/g, "") // zero-width
    .replace(/\u00A0/g, " ") // NBSP -> space
    .trim();
  if (
    t === "" ||
    t === "[]" ||
    t === "-" ||
    t === "—" ||
    /^null$/i.test(t) ||
    /^undefined$/i.test(t)
  )
    return "";
  return t;
}

export function asInt(v: unknown): number {
  const t = norm(v)
    .replace(/[₫đ$€£¥]/gi, "")
    .replace(/[,. _]/g, "");
  const n = Number.parseInt(t || "0", 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function asBool(v: unknown): boolean {
  const s = norm(v).toLowerCase();
  return (
    s === "true" ||
    s === "1" ||
    s === "yes" ||
    s === "y" ||
    s === "x" ||
    s === "✓"
  );
}

export function asStatus(v: unknown): "DRAFT" | "PUBLISHED" | "ARCHIVED" {
  const s = norm(v).toUpperCase();
  return s === "DRAFT" || s === "ARCHIVED" ? s : "PUBLISHED";
}

export function asDateIsoOrNull(v: unknown): string | null {
  const s = norm(v);
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

// export function parseTags(v: unknown): string[] {
//   if (Array.isArray(v)) return v.map((x) => norm(x)).filter(Boolean);
//   const s = norm(v);
//   if (!s) return [];
//   return Array.from(
//     new Set(
//       s
//         .split(/[|,;]/g)
//         .map((x) => x.trim())
//         .filter(Boolean)
//     )
//   );
// }

/** Parse images: "url#alt#pos" | "url::alt::pos" | chỉ "url" | nhiều mục ngăn cách , ; | */
export function parseImages(v: unknown): ImageItem[] {
  const s = norm(v);
  if (!s) return [];
  const items = s
    .split(/[|,;]/g)
    .map((x) => x.trim())
    .filter(Boolean);
  const out: ImageItem[] = [];
  items.forEach((token, i) => {
    const byHash = token.split("#");
    const byCol = token.split("::");
    let url = token;
    let alt: string | null | undefined;
    let pos: number | undefined;

    if (byHash.length >= 2) {
      url = byHash[0].trim();
      alt = norm(byHash[1]) || null;
      if (byHash.length >= 3) {
        const p = Number.parseInt(byHash[2] || "", 10);
        pos = Number.isFinite(p) ? p : i;
      }
    } else if (byCol.length >= 2) {
      url = byCol[0].trim();
      alt = norm(byCol[1]) || null;
      if (byCol.length >= 3) {
        const p = Number.parseInt(byCol[2] || "", 10);
        pos = Number.isFinite(p) ? p : i;
      }
    } else {
      url = token;
      alt = null;
      pos = i;
    }

    if (url) out.push({ url, alt, position: pos });
  });
  return out;
}

/* ----------------------- header mapping mở rộng ---------------------- */
export type HeaderKey =
  | "name"
  | "slug"
  | "price"
  | "sku"
  | "stock"
  | "imageUrl"
  | "description"
  | "brandName"
  | "categoryName"
  // mở rộng
  | "compareAtPrice"
  | "shortDescription"
  | "ingredients"
  | "usage"
  | "volume"
  | "volumeUnit"
  | "origin"
  //   | "tags"
  | "isFeatured"
  | "status"
  | "publishedAt"
  | "metaTitle"
  | "metaDescription";
// | "images"

/** Labels tiếng Việt cho UI hiển thị */
export const headerLabels: Record<HeaderKey, string> = {
  name: "Tên sản phẩm",
  slug: "Đường dẫn",
  price: "Giá bán",
  sku: "Mã sản phẩm",
  stock: "Số lượng",
  imageUrl: "Ảnh đại diện",
  description: "Mô tả chi tiết",
  brandName: "Thương hiệu",
  categoryName: "Danh mục",
  compareAtPrice: "Giá cũ",
  shortDescription: "Mô tả ngắn",
  ingredients: "Thành phần",
  usage: "Hướng dẫn sử dụng",
  volume: "Dung tích",
  volumeUnit: "Đơn vị dung tích",
  origin: "Xuất xứ",
  //   tags: "Nhãn / Từ khóa",
  isFeatured: "Nổi bật",
  status: "Trạng thái",
  publishedAt: "Ngày đăng",
  metaTitle: "Tiêu đề SEO",
  metaDescription: "Mô tả SEO",
  // images: "Bộ sưu tập ảnh (Gallery)",
};

export function normalizeKey(x: string) {
  return x
    .replace(/\uFEFF/g, "") // BOM
    .replace(/[\u200B-\u200D\u2060]/g, "") // zero-width
    .replace(/\u00A0/g, " ") // NBSP -> space
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/[_\-./]+/g, " ") // list_price -> "list price"
    .replace(/\s+/g, " ")
    .trim();
}

function hasWord(s: string, w: string) {
  return new RegExp(`(?:^|\\s)${w}(?:$|\\s)`).test(s);
}

export function pickHeader(h: string): HeaderKey | null {
  const s = normalizeKey(h);
  const has = (...cands: string[]) =>
    cands.some((k) => s.includes(normalizeKey(k)));

  // ƯU TIÊN: "compare at price" / "list price" trước price
  if (
    has("compare at price") ||
    has("compareatprice") ||
    (hasWord(s, "list") && hasWord(s, "price")) ||
    has("gia cu", "giá cũ", "gia goc", "giá gốc", "old price", "list price")
  ) {
    return "compareAtPrice";
  }

  if (
    hasWord(s, "name") ||
    has("ten", "tên sản phẩm", "product", "san pham", "sản phẩm")
  )
    return "name";
  if (hasWord(s, "slug") || has("duong dan", "đường dẫn")) return "slug";

  // PRICE: chỉ match từ nguyên "price" / "giá bán"
  if (hasWord(s, "price") || has("gia ban", "giá bán", "giaban"))
    return "price";

  // SKU (mở rộng alias)
  if (
    s.startsWith("sku") ||
    hasWord(s, "sku") ||
    has("sku code", "product code", "item code", "model") ||
    has("ma sp", "mã sp", "ma san pham", "mã sản phẩm", "ma hang", "mã hàng")
  )
    return "sku";

  if (has("stock", "ton", "tồn", "ton kho", "so luong", "số lượng"))
    return "stock";
  if (has("imageurl") || hasWord(s, "image") || has("anh", "ảnh"))
    return "imageUrl";
  if (has("desc", "description", "mo ta", "mô tả")) return "description";
  if (has("brand", "thuong hieu", "thương hiệu", "hang", "hãng"))
    return "brandName";
  if (has("category", "danh muc", "danh mục")) return "categoryName";
  if (has("short description", "shortdesc", "mo ta ngan", "mô tả ngắn"))
    return "shortDescription";
  if (has("ingredients", "thanh phan", "thành phần")) return "ingredients";
  if (has("usage", "huong dan", "hướng dẫn", "how to use", "cach dung"))
    return "usage";
  if (
    has("volume_ml", "dung tich", "dung tích") ||
    hasWord(s, "size") ||
    hasWord(s, "volume_ml")
  )
    return "volume";
  if (
    has("volume_unit", "dung tich", "dung tích") ||
    hasWord(s, "size") ||
    hasWord(s, "volume_unit")
  )
    return "volumeUnit";
  if (has("origin", "xuat xu", "xuất xứ", "country of origin")) return "origin";
  //   if (has("tags", "nhan", "nhãn", "label")) return "tags";
  if (has("featured", "is featured", "noi bat", "nổi bật")) return "isFeatured";
  if (has("status", "trang thai", "trạng thái")) return "status";
  if (has("published at", "published", "ngay dang", "ngày đăng", "public date"))
    return "publishedAt";
  if (has("meta title", "metatitle", "seo title", "tieu de seo", "tiêu đề seo"))
    return "metaTitle";
  if (
    has(
      "meta description",
      "metadescription",
      "seo description",
      "mo ta seo",
      "mô tả seo"
    )
  )
    return "metaDescription";
  // if (has("images", "gallery", "anh phu", "ảnh phụ")) return "images";

  return null;
}

/** Dùng cho UI tiếng Việt (nếu cần hiển thị) */
export function toVietnameseRows(rows: ImportRow[]) {
  return rows.map((row) => {
    const r: Record<string, unknown> = {};
    (Object.keys(headerLabels) as HeaderKey[]).forEach((k) => {
      const label = headerLabels[k];
      r[label] = (row as Record<string, unknown>)[k];
    });
    return r;
  });
}

/** Thứ tự cột gợi ý cho UI */
export const DEFAULT_COLUMN_KEYS: (keyof ImportRow | "errors")[] = [
  "name",
  "price",
  "compareAtPrice",
  "sku",
  "stock",
  "brandName",
  "categoryName",
  "imageUrl",
  "shortDescription",
  "description",
  "ingredients",
  "usage",
  "volume",
  "origin",
  //   "tags",
  "isFeatured",
  "status",
  "publishedAt",
  "metaTitle",
  "metaDescription",
  "errors",
];
