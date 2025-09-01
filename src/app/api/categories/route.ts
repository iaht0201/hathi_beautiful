import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export async function GET() {
  const items = await prisma.category.findMany({
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

  const existed = await prisma.category.findFirst({
    where: { slug },
    select: { id: true },
  });
  if (existed) {
    return NextResponse.json(
      { message: "Tên/slug đã tồn tại" },
      { status: 409 }
    );
  }

  const created = await prisma.category.create({
    data: { name: n, slug },
    select: { id: true, name: true },
  });

  return NextResponse.json(created, { status: 201 });
}
