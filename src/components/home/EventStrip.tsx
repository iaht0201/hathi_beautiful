// // components/home/EventStrip.tsx
// import type { EventInfoSchema } from "@/types/product";

// export default function EventStrip({ events }: { events: EventInfoSchema[] }) {
//   if (!events.length) return null;
//   return (
//     <div className="my-6 overflow-hidden rounded-full border bg-white">
//       <div className="flex items-center gap-6 whitespace-nowrap p-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
//         {events.map((e) => (
//           <span key={e.id} className="text-sm font-medium text-gray-700">
//             {e.label}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }
