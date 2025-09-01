import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isAdminPath =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  if (!isAdminPath) return NextResponse.next();

  const authed = req.cookies.get("hathi_admin")?.value === "ok";
  if (authed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
