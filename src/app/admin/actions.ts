"use server";

import { redirect } from "next/navigation";
import { clearAuthAction } from "@/lib/auth";

export async function logout() {
  await clearAuthAction();
  redirect("/admin/login");
}
