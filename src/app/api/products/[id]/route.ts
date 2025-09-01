import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { z } from "zod";
import { makeProductSeo } from "@/utils/seo";

export const runtime = "nodejs";

const ImgSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
});

const BodySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sku: z.string().optional().nullable(),
  price: z.number().int().nonnegative().optional(),
  compareAtPrice: z.number().int().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().optional(),

  imageUrl: z.string().optional().nullable(),
  images: z.union([z.array(z.string()), z.array(ImgSchema)]).optional(),

  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  usage: z.string().optional().nullable(),
  volume: z.string().optional().nullable(),
  volumeUnit: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  // tags: z.array(z.string()).optional(),

  isFeatured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),

  brandId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),

  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});
function normalizeImages(
  input: unknown
): { url: string; alt: string | null; position: number }[] | undefined {
  if (input === undefined) return undefined;
  if (!Array.isArray(input)) return [];

  const out: { url: string; alt: string | null; position: number }[] = [];
  for (let i = 0; i < input.length; i++) {
    const it = input[i];
    if (typeof it === "string") {
      const url = it.trim();
      if (url) out.push({ url, alt: null, position: i });
    } else if (it && typeof it === "object") {
      const obj = it as Record<string, unknown>;
      const url = String(obj.url || "").trim();
      if (!url) continue;
      const alt =
        obj.alt === undefined || obj.alt === null
          ? null
          : String(obj.alt ?? "");
      const position =
        typeof obj.position === "number" && Number.isFinite(obj.position)
          ? obj.position
          : i;
      out.push({ url, alt, position });
    }
  }
  // sắp xếp theo position để đảm bảo thứ tự
  out.sort((a, b) => a.position - b.position);
  // reindex position liên tục 0..n-1
  return out.map((x, idx) => ({ ...x, position: idx }));
}

async function ensureUniqueSlug(base: string, excludeId: string) {
  const clean = (base || "san-pham").trim();
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = i === 1 ? clean : `${clean}-${i}`;
    const exists = await prisma.product.findFirst({
      where: { slug: candidate, NOT: { id: excludeId } },
      select: { id: true },
    });
    if (!exists) return candidate;
    i++;
    if (i > 10000) throw new Error("Slug generator overflow");
  }
}

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;
//   const parsed = BodySchema.safeParse(await req.json());
//   if (!parsed.success) {
//     return NextResponse.json(
//       { message: parsed.error.message },
//       { status: 400 }
//     );
//   }
//   const body = parsed.data;
//   const images = Array.isArray(body.images) ? body.images : [];
//   const imageUrl = body.imageUrl ?? images[0] ?? null;
//   const curr = await prisma.product.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       brand: { select: { name: true } },
//       category: { select: { name: true } },
//     },
//   });
//   if (!curr)
//     return NextResponse.json({ message: "Not found" }, { status: 404 });

//   // slug
//   const baseSlug = slugify(body.slug || body.name || curr.slug);
//   const slug = await ensureUniqueSlug(baseSlug, id);

//   // SEO auto if thiếu
//   const needSeo =
//     body.metaTitle === undefined || body.metaDescription === undefined;
//   let metaTitle = body.metaTitle ?? undefined;
//   let metaDescription = body.metaDescription ?? undefined;

//   if (needSeo) {
//     const { metaTitle: mt, metaDescription: md } = makeProductSeo({
//       name: body.name ?? curr.name,
//       brandName: curr.brand?.name ?? undefined,
//       categoryName: curr.category?.name ?? undefined,
//       volume: body.volume ?? undefined,
//       shortDescription: body.shortDescription ?? undefined,
//       description: body.description ?? undefined,
//     });
//     if (metaTitle === undefined) metaTitle = mt;
//     if (metaDescription === undefined) metaDescription = md;
//   }

//   const updated = await prisma.product.update({
//     where: { id },
//     data: {
//       name: body.name,
//       slug,
//       sku: body.sku ?? undefined,
//       price: body.price,
//       compareAtPrice: body.compareAtPrice === null ? null : body.compareAtPrice,
//       stock: body.stock,

//       imageUrl: body.imageUrl === undefined ? undefined : body.imageUrl ?? null,

//       shortDescription:
//         body.shortDescription === undefined
//           ? undefined
//           : body.shortDescription ?? null,
//       description:
//         body.description === undefined ? undefined : body.description ?? null,
//       ingredients:
//         body.ingredients === undefined ? undefined : body.ingredients ?? null,
//       usage: body.usage === undefined ? undefined : body.usage ?? null,
//       volume: body.volume === undefined ? undefined : body.volume ?? null,
//       origin: body.origin === undefined ? undefined : body.origin ?? null,
//       // tags: body.tags,

//       isFeatured: body.isFeatured,
//       status: body.status,
//       publishedAt:
//         body.publishedAt === undefined
//           ? undefined
//           : body.publishedAt
//           ? new Date(body.publishedAt)
//           : null,

//       brandId: body.brandId === undefined ? undefined : body.brandId ?? null,
//       categoryId:
//         body.categoryId === undefined ? undefined : body.categoryId ?? null,

//       metaTitle: metaTitle === undefined ? undefined : metaTitle ?? null,
//       metaDescription:
//         metaDescription === undefined ? undefined : metaDescription ?? null,

//       // ảnh gallery: replace-all đơn giản (dễ hiểu & ổn với admin)
//       ...(body.images
//         ? {
//             images: {
//               deleteMany: { productId: id },
//               create: body.images.map((img, idx) => ({
//                 url: img.url,
//                 alt: img.alt ?? null,
//                 position: img.position ?? idx,
//               })),
//             },
//           }
//         : {}),
//     },
//     select: { id: true, slug: true },
//   });

//   return NextResponse.json(updated);
// }

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.message },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const curr = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  });
  if (!curr)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  // slug
  const baseSlug = slugify(body.slug || body.name || curr.slug);
  const slug = await ensureUniqueSlug(baseSlug, id);

  // SEO auto nếu thiếu
  const needSeo =
    body.metaTitle === undefined || body.metaDescription === undefined;
  let metaTitle = body.metaTitle ?? undefined;
  let metaDescription = body.metaDescription ?? undefined;

  if (needSeo) {
    const { metaTitle: mt, metaDescription: md } = makeProductSeo({
      name: body.name ?? curr.name,
      brandName: curr.brand?.name ?? undefined,
      categoryName: curr.category?.name ?? undefined,
      volume: body.volume ?? undefined,
      shortDescription: body.shortDescription ?? undefined,
      description: body.description ?? undefined,
    });
    if (metaTitle === undefined) metaTitle = mt;
    if (metaDescription === undefined) metaDescription = md;
  }

  // Chuẩn hoá images (có thể là string[] hoặc object[])
  const normalizedImages = normalizeImages(body.images);

  // Xử lý imageUrl:
  // - undefined  => giữ nguyên (không set vào data)
  // - null       => set null
  // - string     => set string
  // (Tuỳ chọn) nếu muốn tự động set = ảnh đầu tiên khi body.imageUrl === null,
  // bạn có thể thay thế nhánh null phía dưới.
  const imageUrlField =
    body.imageUrl === undefined
      ? normalizedImages && normalizedImages.length > 0
        ? { imageUrl: normalizedImages[0].url } // auto từ ảnh đầu
        : {} // không thay đổi nếu không có ảnh
      : { imageUrl: body.imageUrl }; // string | null

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug,
      sku: body.sku === undefined ? undefined : body.sku ?? null,
      price: body.price,
      compareAtPrice:
        body.compareAtPrice === undefined
          ? undefined
          : body.compareAtPrice ?? null,
      stock: body.stock,

      ...imageUrlField, // 👈 áp dụng logic imageUrl

      shortDescription:
        body.shortDescription === undefined
          ? undefined
          : body.shortDescription ?? null,
      description:
        body.description === undefined ? undefined : body.description ?? null,
      ingredients:
        body.ingredients === undefined ? undefined : body.ingredients ?? null,
      usage: body.usage === undefined ? undefined : body.usage ?? null,
      volume: body.volume === undefined ? undefined : body.volume ?? null,
      volumeUnit:
        body.volumeUnit === undefined ? undefined : body.volumeUnit ?? null,
      origin: body.origin === undefined ? undefined : body.origin ?? null,

      isFeatured: body.isFeatured,
      status: body.status,
      publishedAt:
        body.publishedAt === undefined
          ? undefined
          : body.publishedAt
          ? new Date(body.publishedAt)
          : null,

      brandId: body.brandId === undefined ? undefined : body.brandId ?? null,
      categoryId:
        body.categoryId === undefined ? undefined : body.categoryId ?? null,

      metaTitle: metaTitle === undefined ? undefined : metaTitle ?? null,
      metaDescription:
        metaDescription === undefined ? undefined : metaDescription ?? null,

      // ảnh gallery: replace-all khi client gửi lên "images"
      ...(normalizedImages !== undefined
        ? {
            images: {
              deleteMany: { productId: id },
              create: normalizedImages.map((img) => ({
                url: img.url,
                alt: img.alt,
                position: img.position,
              })),
            },
          }
        : {}),
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(updated);
}
