// components/home/About.tsx
export default function About() {
  return (
    <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Về Hathi
        </h2>
        <p className="mt-3 text-gray-600">
          Hathi mang đến giải pháp chăm sóc da lành tính, hiệu quả, phù hợp cho
          mọi loại da. Sản phẩm được chọn lọc kỹ lưỡng, rõ ràng nguồn gốc, minh
          bạch thành phần.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700 md:max-w-md">
          <li className="rounded-xl bg-rose-50 p-3">• Tư vấn 1-1</li>
          <li className="rounded-xl bg-rose-50 p-3">• Giao hàng nhanh</li>
          <li className="rounded-xl bg-rose-50 p-3">• Đổi trả dễ dàng</li>
          <li className="rounded-xl bg-rose-50 p-3">• Cam kết chính hãng</li>
        </ul>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <img
          src="/about.jpg"
          alt="About Hathi"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  );
}
