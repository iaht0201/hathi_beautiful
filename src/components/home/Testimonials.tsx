// components/home/Testimonials.tsx
export default function Testimonials() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
        Khách hàng nói gì?
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <blockquote
            key={i}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-700">
              Sản phẩm dùng rất dịu, giao nhanh và tư vấn tận tâm. Sẽ quay lại!
            </p>
            <footer className="mt-3 text-xs text-gray-500">
              — Khách hàng {i}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
