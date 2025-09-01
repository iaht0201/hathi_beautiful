import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export async function GET() {
  const items = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { name, description } = (await req.json()) as {
    name?: string;
    description?: string | null;
  };

  const n = (name ?? "").trim();
  if (!n) return NextResponse.json({ message: "Thiếu tên" }, { status: 400 });

  const slug = slugify(n);

  // tránh lỗi unique trên slug
  const existed = await prisma.brand.findFirst({
    where: { slug },
    select: { id: true },
  });
  if (existed) {
    return NextResponse.json(
      { message: "Tên/slug đã tồn tại" },
      { status: 409 }
    );
  }

  const created = await prisma.brand.create({
    data: { name: n, slug },
    select: { id: true, name: true },
  });

  return NextResponse.json(created, { status: 201 });
}
