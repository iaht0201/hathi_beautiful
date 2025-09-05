import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/admin/actions"; // lưu ý import absolute

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const authed = store.get("hathi_admin")?.value === "ok";
  if (!authed) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <nav className="flex gap-4">
            <Link href="/admin/products" className="font-semibold">
              Sản phẩm
            </Link>
            <Link href="/admin/brands">Hãng</Link>
            <Link href="/admin/categories">Danh mục</Link>
            <Link href="/admin/hero-slides">Hero Slides</Link>
          </nav>
          <form action={logout}>
            <button type="submit" className="text-sm underline">
              Đăng xuất
            </button>
          </form>
        </div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
