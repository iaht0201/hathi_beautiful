// components/home/CTA.tsx
import Link from "next/link";

export default function CTA() {
  return (
    <section className="rounded-3xl bg-gray-900 p-8 text-center text-white md:p-12">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Cần tư vấn routine cho da của bạn?
      </h2>
      <p className="mt-2 text-white/80">
        Nhắn Zalo để được tư vấn sản phẩm phù hợp nhất
      </p>
      <Link
        href="https://zalo.me/"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-white/90"
      >
        Chat Zalo ngay
      </Link>
    </section>
  );
}
