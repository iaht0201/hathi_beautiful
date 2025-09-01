// src/app/admin/login/actions.ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  if (pw !== process.env.ADMIN_PASSWORD) return { ok: false };
  (await cookies()).set("hathi_admin", "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin/products");
}
