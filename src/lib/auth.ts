// src/lib/auth.ts
import { cookies } from "next/headers";

export const COOKIE_KEY = "hathi_admin";
const BASE = { httpOnly: true, sameSite: "lax" as const, path: "/" };

// Dùng để check trong RSC/layout
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_KEY)?.value === "ok";
}

// CHỈ dùng trong Server Action (không gọi trong route handler)
export async function setAuthAction() {
  const store = await cookies();
  store.set(COOKIE_KEY, "ok", { ...BASE, maxAge: 60 * 60 * 8 });
}

// CHỈ dùng trong Server Action (không gọi trong route handler)
export async function clearAuthAction() {
  const store = await cookies();
  store.delete(COOKIE_KEY);
}
