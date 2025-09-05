// // components/home/FeaturedProducts.tsx
// "use client";

// import { useRef } from "react";
// import type { ProductSchema } from "@/types/product";
// import { ProductCard } from "@/components/ui/ProductCard";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// export default function FeaturedProducts({
//   products,
// }: {
//   products: ProductSchema[];
// }) {
//   const scrollerRef = useRef<HTMLDivElement>(null);
//   if (!products.length) return null;

//   const scrollBy = (offset: number) => () => {
//     scrollerRef.current?.scrollBy({ left: offset, behavior: "smooth" });
//   };

//   return (
//     <section className="space-y-4">
//       <div className="flex items-end justify-between">
//         <div>
//           <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
//             Sản phẩm nổi bật
//           </h2>
//           <p className="text-sm text-gray-500">
//             Được khách hàng yêu thích nhất
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             aria-label="Prev"
//             onClick={scrollBy(-320)}
//             className="rounded-full border p-2 hover:bg-gray-50"
//           >
//             <ChevronLeft className="h-5 w-5" />
//           </button>
//           <button
//             aria-label="Next"
//             onClick={scrollBy(320)}
//             className="rounded-full border p-2 hover:bg-gray-50"
//           >
//             <ChevronRight className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       <div
//         ref={scrollerRef}
//         className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:gap-6"
//       >
//         {products.map((p) => (
//           <div
//             key={p.id}
//             className="snap-start shrink-0 basis-[240px] md:basis-[280px]"
//           >
//             <ProductCard product={p} />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
