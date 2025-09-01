import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { makeProductSeo } from "@/utils/seo";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/** Hàng import */
type Row = {
  name: string;
  slug?: string | null;
  price?: number | string | null;
  sku?: string | null;
  stock?: number | string | null;
  imageUrl?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  ingredients?: string | null;
  usage?: string | null;
  volume?: string | null;
  origin?: string | null;
  compareAtPrice?: number | string | null;
  // tags?: string[] | string | null;
  isFeatured?: boolean | string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string | null;
  publishedAt?: string | Date | null;

  brandName?: string | null;
  categoryName?: string | null;

  metaTitle?: string | null;
  metaDescription?: string | null;
};

type RowResult = {
  name: string;
  action: "created" | "updated" | "skipped";
  reason?: string;
  id?: string;
};

/* ---------------- helpers chung ---------------- */
function toStr(v: unknown): string {
  return String(v ?? "").trim();
}
function toStrOrNull(v: unknown): string | null {
  const s = toStr(v);
  return s ? s : null;
}
function toInt(v: unknown): number {
  const s = toStr(v).replace(/[ ,._]/g, "");
  const n = Number.parseInt(s || "0", 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
function toBool(v: unknown): boolean {
  const s = toStr(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "y";
}
function toStatus(v: unknown): "DRAFT" | "PUBLISHED" | "ARCHIVED" {
  const s = toStr(v).toUpperCase();
  return s === "DRAFT" || s === "ARCHIVED" ? s : "PUBLISHED";
}
function toDateOrNull(v: unknown): Date | null {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = toStr(v);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
// function parseTags(v: unknown): string[] {
//   if (Array.isArray(v)) {
//     return v.map((x) => toStr(x)).filter(Boolean);
//   }
//   const s = toStr(v);
//   if (!s) return [];
//   // hỗ trợ "a,b,c" hoặc "a|b|c"
//   const parts = s
//     .split(/[|,]/g)
//     .map((x) => x.trim())
//     .filter(Boolean);
//   return Array.from(new Set(parts));
// }

/* ---------------- slug unique cho từng model ---------------- */
async function ensureUniqueSlugProduct(
  base: string,
  excludeId?: string
): Promise<string> {
  const clean = (base || "san-pham").trim();
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = i === 1 ? clean : `${clean}-${i}`;
    const exists = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!exists) return candidate;
    i++;
    if (i > 10000) throw new Error("Slug generator overflow (product)");
  }
}
async function ensureUniqueSlugBrand(base: string): Promise<string> {
  const clean = (base || "brand").trim();
  let i = 1;
  while (true) {
    const candidate = i === 1 ? clean : `${clean}-${i}`;
    const exists = await prisma.brand.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    i++;
    if (i > 10000) throw new Error("Slug generator overflow (brand)");
  }
}
async function ensureUniqueSlugCategory(base: string): Promise<string> {
  const clean = (base || "category").trim();
  let i = 1;
  while (true) {
    const candidate = i === 1 ? clean : `${clean}-${i}`;
    const exists = await prisma.category.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    i++;
    if (i > 10000) throw new Error("Slug generator overflow (category)");
  }
}

/* -------------- tạo/đọc brand & category theo tên (có cache) -------------- */
function normalizeKeyName(name: string): string {
  return slugify(name).replace(/-/g, " ");
}
const brandCache = new Map<string, string>();
const categoryCache = new Map<string, string>();

async function getOrCreateBrandId(
  name?: string | null
): Promise<string | null> {
  const n = toStr(name);
  if (!n) return null;
  const key = normalizeKeyName(n);
  const cached = brandCache.get(key);
  if (cached) return cached;

  const existed = await prisma.brand.findFirst({
    where: { name: { equals: n, mode: "insensitive" } },
    select: { id: true },
  });
  if (existed) {
    brandCache.set(key, existed.id);
    return existed.id;
  }
  const slug = await ensureUniqueSlugBrand(slugify(n));
  try {
    const created = await prisma.brand.create({
      data: { name: n, slug },
      select: { id: true },
    });
    brandCache.set(key, created.id);
    return created.id;
  } catch {
    const again = await prisma.brand.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (again) {
      brandCache.set(key, again.id);
      return again.id;
    }
    throw new Error("Không thể tạo Brand");
  }
}
async function getOrCreateCategoryId(
  name?: string | null
): Promise<string | null> {
  const n = toStr(name);
  if (!n) return null;
  const key = normalizeKeyName(n);
  const cached = categoryCache.get(key);
  if (cached) return cached;

  const existed = await prisma.category.findFirst({
    where: { name: { equals: n, mode: "insensitive" } },
    select: { id: true },
  });
  if (existed) {
    categoryCache.set(key, existed.id);
    return existed.id;
  }
  const slug = await ensureUniqueSlugCategory(slugify(n));
  try {
    const created = await prisma.category.create({
      data: { name: n, slug },
      select: { id: true },
    });
    categoryCache.set(key, created.id);
    return created.id;
  } catch {
    const again = await prisma.category.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (again) {
      categoryCache.set(key, again.id);
      return again.id;
    }
    throw new Error("Không thể tạo Category");
  }
}

/* --------------------------------- POST -------------------------------- */
export async function POST(req: Request) {
  const payload = (await req.json()) as {
    rows: Row[];
    updateExisting: boolean;
  };

  if (!Array.isArray(payload.rows)) {
    return NextResponse.json(
      { message: "Payload không hợp lệ" },
      { status: 400 }
    );
  }

  let created = 0,
    updated = 0,
    skipped = 0;
  const results: RowResult[] = [];

  for (const r of payload.rows) {
    const name = toStr(r.name);
    if (!name) {
      skipped++;
      results.push({ name, action: "skipped", reason: "Thiếu name" });
      continue;
    }

    // Tìm product theo name → slug
    let target = await prisma.product.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (!target && toStr(r.slug)) {
      const bySlug = await prisma.product.findFirst({
        where: { slug: toStr(r.slug) },
        select: { id: true },
      });
      if (bySlug) target = bySlug;
    }

    // Chuẩn hóa + tạo/lấy brand/category
    const brandId = await getOrCreateBrandId(r.brandName);
    const categoryId = await getOrCreateCategoryId(r.categoryName);

    const baseSlug = slugify(r.slug ? toStr(r.slug) : name);
    const normalized = {
      name,
      slug: baseSlug,
      price: toInt(r.price),
      sku: toStrOrNull(r.sku),
      stock: toInt(r.stock),
      imageUrl: toStrOrNull(r.imageUrl),

      // fields mở rộng
      compareAtPrice: r.compareAtPrice == null ? null : toInt(r.compareAtPrice),
      shortDescription: toStrOrNull(r.shortDescription),
      description: toStrOrNull(r.description),
      ingredients: toStrOrNull(r.ingredients),
      usage: toStrOrNull(r.usage),
      volume: toStrOrNull(r.volume),
      origin: toStrOrNull(r.origin),
      // tags: parseTags(r.tags),
      isFeatured: r.isFeatured == null ? false : toBool(r.isFeatured),
      status: toStatus(r.status),
      publishedAt: toDateOrNull(r.publishedAt),

      brandId,
      categoryId,
    };

    // SEO tự sinh nếu thiếu
    const { metaTitle, metaDescription } = makeProductSeo({
      name: normalized.name,
      brandName: r.brandName ?? undefined,
      categoryName: r.categoryName ?? undefined,
      volume: normalized.volume ?? undefined,
      shortDescription: normalized.shortDescription ?? undefined,
      description: normalized.description ?? undefined,
    });

    const seoTitle = toStr(r.metaTitle) || metaTitle;
    const seoDesc = toStr(r.metaDescription) || metaDescription;

    try {
      if (target) {
        if (!payload.updateExisting) {
          skipped++;
          results.push({
            name,
            action: "skipped",
            reason: "Trùng (name/slug) nhưng không cho cập nhật",
          });
          continue;
        }
        const uniqueSlug = await ensureUniqueSlugProduct(
          normalized.slug,
          target.id
        );
        const p = await prisma.product.update({
          where: { id: target.id },
          data: {
            ...normalized,
            slug: uniqueSlug,
            metaTitle: seoTitle,
            metaDescription: seoDesc,
          },
          select: { id: true },
        });
        updated++;
        results.push({ name, action: "updated", id: p.id });
      } else {
        const uniqueSlug = await ensureUniqueSlugProduct(normalized.slug);
        try {
          const p = await prisma.product.create({
            data: {
              ...normalized,
              slug: uniqueSlug,
              metaTitle: seoTitle,
              metaDescription: seoDesc,
            },
            select: { id: true },
          });
          created++;
          results.push({ name, action: "created", id: p.id });
        } catch (e: unknown) {
          // Nếu đụng unique slug → phát sinh slug mới và retry 1 lần
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            const meta = String(e.meta ?? "");
            if (e.code === "P2002" && meta.includes("slug")) {
              const uniqueSlug2 = await ensureUniqueSlugProduct(
                normalized.slug
              );
              const p = await prisma.product.create({
                data: {
                  ...normalized,
                  slug: uniqueSlug2,
                  metaTitle: seoTitle,
                  metaDescription: seoDesc,
                },
                select: { id: true },
              });
              created++;
              results.push({
                name,
                action: "created",
                id: p.id,
                reason: "Slug trùng → đổi slug",
              });
              continue;
            }
          }
          skipped++;
          results.push({
            name,
            action: "skipped",
            reason: `Lỗi: ${(e as Error).message}`,
          });
        }
      }
    } catch (e) {
      skipped++;
      results.push({
        name,
        action: "skipped",
        reason: `Lỗi: ${(e as Error).message}`,
      });
    }
  }

  return NextResponse.json({ created, updated, skipped, results });
}
