"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const p = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });

  if (p?.imageUrl?.startsWith("/uploads/")) {
    const abs = path.join(process.cwd(), "public", p.imageUrl);
    await unlink(abs).catch(() => {});
  }
  revalidatePath("/admin/products");
}
