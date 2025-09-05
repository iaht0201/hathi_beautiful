// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCategoryInput } from "@/lib/validation/category";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const parsed = updateCategoryInput.parse({ ...json, id: params.id });

  // cập nhật category + ảnh (upsert đơn giản)
  const updates =
    parsed.images?.map((img) => ({
      where: { id: img.id ?? "new" }, // trick; sẽ fail nếu không dùng upsert
      create: {
        imageUrl: img.imageUrl,
        alt: img.alt,
        isPrimary: !!img.isPrimary,
        sortOrder: img.sortOrder ?? 0,
        categoryId: params.id,
      },
      update: {
        imageUrl: img.imageUrl,
        alt: img.alt,
        isPrimary: !!img.isPrimary,
        sortOrder: img.sortOrder ?? 0,
      },
    })) ?? [];

  // nếu có >=1 isPrimary=true, clear các ảnh khác
  if (parsed.images?.some((i) => i.isPrimary)) {
    await prisma.imageCategory.updateMany({
      where: { categoryId: params.id },
      data: { isPrimary: false },
    });
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      images: updates.length
        ? { upsert: updates } // Prisma cần mảng upsert; type khó chịu, có thể tách vòng lặp để tránh any
        : undefined,
    },
    include: { images: true },
  });

  return NextResponse.json(updated);
}
