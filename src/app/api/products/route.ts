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
  name: z.string().min(2),
  slug: z.string().min(2).optional(), // sẽ ensure unique nếu thiếu
  sku: z.string().optional().nullable(),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),

  imageUrl: z.string().optional().nullable(),
  images: z.array(ImgSchema).optional().default([]),

  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  usage: z.string().optional().nullable(),
  volume: z.string().optional().nullable(),
  volumeUnit: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  // tags: z.array(z.string()).optional().default([]),

  isFeatured: z.boolean().optional().default(false),
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .optional()
    .default("PUBLISHED"),
  publishedAt: z.string().datetime().optional().nullable(),

  brandId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),

  // SEO: nếu bỏ trống → tự sinh
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

async function ensureUniqueSlug(base: string) {
  const clean = (base || "san-pham").trim();
  let i = 1;
  while (true) {
    const candidate = i === 1 ? clean : `${clean}-${i}`;
    const exists = await prisma.product.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    i++;
    if (i > 10000) throw new Error("Slug generator overflow");
  }
}
//  api/products - GET
export async function GET() {
  const items = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, price: true, imageUrl: true },
    take: 30,
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.message },
      { status: 400 }
    );
  }
  const body = parsed.data;

  // slug
  const baseSlug = slugify(body.slug || body.name);
  const slug = await ensureUniqueSlug(baseSlug);

  // SEO (auto nếu thiếu)
  const needSeo = !body.metaTitle || !body.metaDescription;
  let metaTitle = body.metaTitle ?? null;
  let metaDescription = body.metaDescription ?? null;

  if (needSeo) {
    const { metaTitle: mt, metaDescription: md } = makeProductSeo({
      name: body.name,
      brandName: null, // sẽ enrich sau nếu cần
      categoryName: null,
      volume: body.volume ?? null,
      shortDescription: body.shortDescription ?? null,
      description: body.description ?? null,
    });
    metaTitle = metaTitle ?? mt;
    metaDescription = metaDescription ?? md;
  }

  const created = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      sku: body.sku ?? null,
      price: body.price,
      compareAtPrice: body.compareAtPrice ?? null,
      stock: body.stock,

      imageUrl: body.imageUrl ?? null,
      shortDescription: body.shortDescription ?? null,
      description: body.description ?? null,
      ingredients: body.ingredients ?? null,
      usage: body.usage ?? null,
      volume: body.volume ?? null,
      origin: body.origin ?? null,
      // tags: body.tags,

      isFeatured: body.isFeatured ?? false,
      status: body.status ?? "PUBLISHED",
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,

      brandId: body.brandId ?? null,
      categoryId: body.categoryId ?? null,

      metaTitle,
      metaDescription,

      images: body.images?.length
        ? {
            create: body.images
              .map((img, idx) => ({
                url: img.url,
                alt: img.alt ?? null,
                position: img.position ?? idx,
              }))
              .slice(0, 20),
          }
        : undefined,
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(created, { status: 201 });
}
