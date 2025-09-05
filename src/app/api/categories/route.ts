import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { createCategoryInput } from "@/lib/validation/category";

export async function GET() {
  const items = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(items);
}

// app/api/categories/route.ts

export async function POST(req: Request) {
  const json = await req.json();
  const data = createCategoryInput.parse(json);

  // đảm bảo chỉ có 1 isPrimary === true
  const hasPrimary = data.images.some((i) => i.isPrimary);
  const images = hasPrimary
    ? data.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === data.images.findIndex((i) => i.isPrimary),
      }))
    : data.images;

  const created = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      images: { create: images },
    },
    include: { images: true },
  });
  return NextResponse.json(created);
}
