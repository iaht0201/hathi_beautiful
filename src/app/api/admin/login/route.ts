// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { COOKIE_KEY } from "@/lib/auth";

type LoginBody = { password?: string };

export async function POST(req: Request) {
  const { password } = (await req.json()) as LoginBody;
  if (!password) return NextResponse.json({ ok: false }, { status: 400 });
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_KEY, "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_KEY, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
