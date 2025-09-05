// // components/ui/ProductCard.tsx
// import Link from "next/link";
// import type { ProductSchema } from "../../types/product";

// export function ProductCard({ product }: { product: ProductSchema }) {
//   const hasSale =
//     typeof product.salePrice === "number" && product.salePrice! < product.price;
//   return (
//     <Link
//       href={`/product/${product.slug}`}
//       className="group block rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md"
//     >
//       <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
//         <img
//           src={product.thumbnail.url}
//           alt={product.thumbnail.alt}
//           className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//           loading="lazy"
//         />
//       </div>
//       <div className="mt-3 space-y-1">
//         <h3 className="line-clamp-1 text-sm font-medium text-gray-900">
//           {product.name}
//         </h3>
//         <p className="line-clamp-2 min-h-[2.5rem] text-xs text-gray-500">
//           {product.shortDesc ?? ""}
//         </p>
//         <div className="flex items-baseline gap-2">
//           {hasSale ? (
//             <>
//               <span className="text-base font-semibold text-rose-600">
//                 {product.salePrice?.toLocaleString("vi-VN")}₫
//               </span>
//               <span className="text-xs text-gray-400 line-through">
//                 {product.price.toLocaleString("vi-VN")}₫
//               </span>
//             </>
//           ) : (
//             <span className="text-base font-semibold text-gray-900">
//               {product.price.toLocaleString("vi-VN")}₫
//             </span>
//           )}
//         </div>
//       </div>
//     </Link>
//   );
// }
