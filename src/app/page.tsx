// "use client";

// import React, { useState } from "react";
// import {
//   Menu,
//   X,
//   ShoppingBag,
//   ChevronRight,
//   PlayCircle,
//   MessageCircle,
//   Heart,
//   FlaskConical,
//   Sun,
//   Users,
//   MapPin,
// } from "lucide-react";
// import Hero from "@/components/home/Hero";

// /**
//  * NOTE
//  * — This is a single-file, hard‑data mock of https://www.surgictouch.com/ built for Next.js 15 + Tailwind.
//  * — Mobile‑first, fully responsive. No external data calls.
//  * — Replace placeholder images with project assets in /public/images when integrating.
//  * — If you’re using the Next.js app router, drop this as app/page.tsx (or use as <SurgicTouchHome /> anywhere).
//  */

// // -------------------------------
// // Hardcoded content (texts are paraphrased from public site headings)
// // -------------------------------
// const NAV = [
//   { label: "Explore", href: "#explore" },
//   { label: "Shop", href: "#shop" },
//   { label: "Beauty Routine", href: "#beauty" },
//   { label: "Trattamenti", href: "#treatments" },
//   { label: "La Storia", href: "#story" },
//   { label: "Skin Diary", href: "#skin-diary" },
// ];

// const PRODUCTS = [
//   {
//     slug: "pure-jal",
//     name: "Pure Jal",
//     tag: "Siero idratante",
//     blurb: "Idratazione intensa con acido ialuronico.",
//   },
//   {
//     slug: "stress-defence",
//     name: "Stress Defence",
//     tag: "Pelle sensibile",
//     blurb: "Crema fluida lenitiva per pelli reattive.",
//   },
//   {
//     slug: "oxy",
//     name: "Oxy",
//     tag: "Antiossidante",
//     blurb: "Crema viso con azione AOX quotidiana.",
//   },
//   {
//     slug: "booster-30c",
//     name: "Booster 30C",
//     tag: "AOX • Vit C 30%",
//     blurb: "Siero concentrato Vitamina C + Ferulic.",
//   },
//   {
//     slug: "face-pro",
//     name: "Face Pro",
//     tag: "Anti‑age",
//     blurb: "Siero con resveratrolo ad azione lift.",
//   },
//   {
//     slug: "dnp",
//     name: "DNP",
//     tag: "Cell activity",
//     blurb: "Crema che stimola l’attività cellulare.",
//   },
// ];

// const CATEGORIES = [
//   { key: "viso", title: "Linea Viso" },
//   { key: "corpo", title: "Linea Corpo" },
//   { key: "solare", title: "Linea Solare" },
//   { key: "pro", title: "Professionali" },
// ];

// const FEATURE_ICONS = [
//   {
//     icon: PlayCircle,
//     title: "Video Educational",
//     note: "Tutorial & spiegazioni",
//   },
//   { icon: MessageCircle, title: "Live Chat", note: "Supporto vicino a te" },
//   { icon: Heart, title: "Made with Love", note: "Passione & cura" },
//   { icon: FlaskConical, title: "Free Tester", note: "Scopri la linea" },
// ];

// const SOCIAL = [
//   { key: "fb", label: "Facebook" },
//   { key: "ig", label: "Instagram" },
//   { key: "in", label: "LinkedIn" },
//   { key: "yt", label: "YouTube" },
// ];

// // -------------------------------
// // Helper UI
// // -------------------------------
// function Logo() {
//   return (
//     <div className="flex items-center gap-2">
//       <div className="h-8 w-8 rounded bg-zinc-900 dark:bg-zinc-100" />
//       <span className="font-semibold tracking-wide">SurgicTouch</span>
//     </div>
//   );
// }

// function Container({
//   children,
//   className = "",
// }: React.PropsWithChildren<{ className?: string }>) {
//   return (
//     <div
//       className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
//     >
//       {children}
//     </div>
//   );
// }

// function Pill({ children }: React.PropsWithChildren) {
//   return (
//     <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
//       {children}
//     </span>
//   );
// }

// function PlaceholderImg({ className = "", label = "" }) {
//   return (
//     <div
//       className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 ${className}`}
//     >
//       <div className="absolute inset-0 -skew-y-3 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.75),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.35),transparent_60%)]" />
//       <div className="relative flex h-full w-full items-center justify-center p-6 text-center">
//         <span className="text-sm font-medium opacity-60">
//           {label || "Image"}
//         </span>
//       </div>
//     </div>
//   );
// }

// // -------------------------------
// // Sections
// // -------------------------------
// function Header() {
//   const [open, setOpen] = useState(false);
//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/60">
//       <Container className="flex h-16 items-center justify-between">
//         <Logo />
//         <nav className="hidden items-center gap-6 text-sm md:flex">
//           {NAV.map((n) => (
//             <a
//               key={n.label}
//               href={n.href}
//               className="text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
//             >
//               {n.label}
//             </a>
//           ))}
//         </nav>
//         <div className="flex items-center gap-3">
//           <button
//             aria-label="Cart"
//             className="rounded-full border p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
//           >
//             <ShoppingBag className="h-5 w-5" />
//           </button>
//           <button
//             className="md:hidden rounded-full border p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
//             aria-label="Toggle Menu"
//             onClick={() => setOpen((v) => !v)}
//           >
//             {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//           </button>
//         </div>
//       </Container>
//       {/* Mobile menu */}
//       {open && (
//         <div className="border-t bg-white dark:bg-zinc-950 md:hidden">
//           <Container>
//             <div className="grid gap-2 py-4">
//               {NAV.map((n) => (
//                 <a
//                   key={n.label}
//                   href={n.href}
//                   className="rounded-lg px-2 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
//                 >
//                   {n.label}
//                 </a>
//               ))}
//             </div>
//           </Container>
//         </div>
//       )}
//     </header>
//   );
// }

// function Actives() {
//   return (
//     <section
//       id="actives"
//       className="border-y bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-950"
//     >
//       <Container className="grid items-center gap-10 md:grid-cols-2">
//         <div>
//           <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
//             Il potere dei principi attivi
//           </h2>
//           <p className="mt-3 max-w-prose text-zinc-600 dark:text-zinc-300">
//             Metodo “Evidence Based Formula”: ingredienti selezionati e
//             concentrati per un’azione anti‑age reale, supportata da prove di
//             efficacia.
//           </p>
//           <a
//             href="#explore"
//             className="mt-5 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-zinc-900"
//           >
//             Scopri di più <ChevronRight className="ml-1 h-4 w-4" />
//           </a>
//         </div>
//         <PlaceholderImg
//           className="aspect-[16/10]"
//           label="Ingredients / textures"
//         />
//       </Container>
//     </section>
//   );
// }

// function ProductCard({ p }: { p: (typeof PRODUCTS)[number] }) {
//   return (
//     <a href={`#product-${p.slug}`} className="group">
//       <div className="overflow-hidden rounded-2xl border bg-white transition-shadow group-hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
//         <PlaceholderImg className="aspect-[4/3]" label={p.name} />
//         <div className="p-4">
//           <div className="text-xs uppercase tracking-wide text-zinc-500">
//             {p.tag}
//           </div>
//           <div className="mt-1 text-base font-semibold">{p.name}</div>
//           <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
//             {p.blurb}
//           </p>
//           <div className="mt-3 inline-flex items-center text-sm font-medium text-zinc-900 underline decoration-transparent underline-offset-4 transition group-hover:decoration-current dark:text-white">
//             Esplora <ChevronRight className="ml-1 h-4 w-4" />
//           </div>
//         </div>
//       </div>
//     </a>
//   );
// }

// function ProductHighlights() {
//   return (
//     <section id="beauty" className="py-12">
//       <Container>
//         <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
//           Scopri la tua routine di bellezza
//         </h2>
//         <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {PRODUCTS.map((p) => (
//             <ProductCard key={p.slug} p={p} />
//           ))}
//         </div>
//       </Container>
//     </section>
//   );
// }

// function Founders() {
//   return (
//     <section className="border-y bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-950">
//       <Container className="grid items-center gap-10 md:grid-cols-2">
//         <div>
//           <h3 className="text-sm font-semibold tracking-widest text-zinc-500">
//             I FONDATORI
//           </h3>
//           <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
//             Eccellenza cosmeceutica
//           </h2>
//           <p className="mt-3 max-w-prose text-zinc-600 dark:text-zinc-300">
//             Made in Italy, nata dall’esperienza post‑surgery del Dr. Nicola
//             Pittoni e dalla collaborazione con la General Manager Elena
//             Nassimbeni.
//           </p>
//           <a
//             href="#story"
//             className="mt-5 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-zinc-900"
//           >
//             Scopri di più <ChevronRight className="ml-1 h-4 w-4" />
//           </a>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <PlaceholderImg className="aspect-[4/5]" label="Dr. Pittoni" />
//           <PlaceholderImg className="aspect-[4/5]" label="E. Nassimbeni" />
//         </div>
//       </Container>
//     </section>
//   );
// }

// function Categories() {
//   return (
//     <section className="py-12">
//       <Container>
//         <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
//           Scopri per categorie
//         </h2>
//         <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//           {CATEGORIES.map((c) => (
//             <a key={c.key} href={`#cat-${c.key}`} className="group">
//               <div className="overflow-hidden rounded-2xl border bg-white transition-shadow group-hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
//                 <PlaceholderImg className="aspect-[4/3]" label={c.title} />
//                 <div className="p-4">
//                   <div className="text-sm font-semibold">{c.title}</div>
//                 </div>
//               </div>
//             </a>
//           ))}
//         </div>
//       </Container>
//     </section>
//   );
// }

// function Method() {
//   return (
//     <section className="border-y bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-950">
//       <Container className="grid items-center gap-10 md:grid-cols-2">
//         <div>
//           <h3 className="text-sm font-semibold tracking-widest text-zinc-500">
//             IL METODO
//           </h3>
//           <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
//             Evidence‑Based Formula
//           </h2>
//           <ul className="mt-4 space-y-2 text-zinc-700 dark:text-zinc-300">
//             <li className="flex items-start gap-2">
//               <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white" />
//               Alta concentrazione di attivi.
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white" />
//               Selezione di ingredienti con studi clinici.
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white" />
//               Free from: petrolati, siliconi, parabeni, coloranti, profumi
//               sintetici.
//             </li>
//           </ul>
//           <a
//             href="#explore"
//             className="mt-5 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-zinc-900"
//           >
//             Scopri di più <ChevronRight className="ml-1 h-4 w-4" />
//           </a>
//         </div>
//         <PlaceholderImg className="aspect-[16/10]" label="Lab / method" />
//       </Container>
//     </section>
//   );
// }

// function CTABand() {
//   return (
//     <section className="py-12">
//       <Container className="grid gap-6 md:grid-cols-2">
//         <div className="relative overflow-hidden rounded-2xl border p-6 dark:border-zinc-800">
//           <div className="flex items-center gap-3 text-sm font-semibold">
//             <Users className="h-4 w-4" /> Consulenza personalizzata
//           </div>
//           <h3 className="mt-2 text-xl font-semibold">La tua Beauty Routine</h3>
//           <p className="mt-1 max-w-prose text-zinc-600 dark:text-zinc-300">
//             Richiedi una consulenza gratuita per costruire la routine perfetta.
//           </p>
//           <a
//             href="#consult"
//             className="mt-4 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium"
//           >
//             Richiedi una consulenza
//           </a>
//           <PlaceholderImg className="mt-4 aspect-[16/9]" label="Consultation" />
//         </div>
//         <div className="relative overflow-hidden rounded-2xl border p-6 dark:border-zinc-800">
//           <div className="flex items-center gap-3 text-sm font-semibold">
//             <Sun className="h-4 w-4" /> Skin Quiz
//           </div>
//           <h3 className="mt-2 text-xl font-semibold">
//             Effettua il nostro Skin Quiz
//           </h3>
//           <p className="mt-1 max-w-prose text-zinc-600 dark:text-zinc-300">
//             Scopri in pochi step i prodotti più adatti a te.
//           </p>
//           <a
//             href="#quiz"
//             className="mt-4 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium"
//           >
//             Inizia il test
//           </a>
//           <PlaceholderImg className="mt-4 aspect-[16/9]" label="Skin Quiz" />
//         </div>
//       </Container>
//     </section>
//   );
// }

// function FeatureRow() {
//   return (
//     <section className="border-y bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-950">
//       <Container>
//         <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
//           {FEATURE_ICONS.map(({ icon: Icon, title, note }) => (
//             <div
//               key={title}
//               className="rounded-2xl border bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900"
//             >
//               <Icon className="mx-auto h-6 w-6" />
//               <div className="mt-2 text-sm font-semibold">{title}</div>
//               <div className="text-xs text-zinc-500">{note}</div>
//             </div>
//           ))}
//         </div>
//       </Container>
//     </section>
//   );
// }

// function Partners() {
//   return (
//     <section className="py-12">
//       <Container className="grid items-center gap-10 md:grid-cols-2">
//         <div>
//           <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
//             Centri Partners
//           </h2>
//           <p className="mt-3 max-w-prose text-zinc-600 dark:text-zinc-300">
//             Un team formato dalla nostra Academy ti aspetta per una Beauty
//             Experience guidata presso i punti vendita.
//           </p>
//           <a
//             href="#locator"
//             className="mt-5 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium"
//           >
//             Store Locator <MapPin className="ml-1 h-4 w-4" />
//           </a>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <PlaceholderImg className="aspect-[4/3]" label="Partner 1" />
//           <PlaceholderImg className="aspect-[4/3]" label="Partner 2" />
//         </div>
//       </Container>
//     </section>
//   );
// }

// function Footer() {
//   return (
//     <footer className="border-t bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
//       <Container>
//         <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
//           <div>
//             <Logo />
//             <p className="mt-3 max-w-xs text-sm text-zinc-600 dark:text-zinc-300">
//               Cosmeceutici nati dall’esperienza dermatologica. Copyright © 2025.
//             </p>
//             <div className="mt-4 flex gap-3">
//               {SOCIAL.map((s) => (
//                 <a
//                   key={s.key}
//                   href="#"
//                   className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
//                 >
//                   {s.label}
//                 </a>
//               ))}
//             </div>
//           </div>

//           <div>
//             <div className="text-sm font-semibold">Contatti</div>
//             <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
//               <li>Tel. 0432 502969 (Lun‑Ven 9.00‑17.30)</li>
//               <li>
//                 <a className="underline" href="#">
//                   Richiedi una consulenza
//                 </a>
//               </li>
//               <li>
//                 <a className="underline" href="#">
//                   Store Locator
//                 </a>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <div className="text-sm font-semibold">Chi Siamo</div>
//             <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
//               <li>
//                 <a className="underline" href="#story">
//                   La Storia
//                 </a>
//               </li>
//               <li>
//                 <a className="underline" href="#explore">
//                   I Cosmeceutici
//                 </a>
//               </li>
//               <li>
//                 <a className="underline" href="#pro">
//                   Area Professionale
//                 </a>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <div className="text-sm font-semibold">Newsletter</div>
//             <form className="mt-3 flex max-w-sm gap-2">
//               <input
//                 className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-950"
//                 placeholder="Email address"
//               />
//               <button
//                 type="button"
//                 className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
//               >
//                 Iscriviti
//               </button>
//             </form>
//             <p className="mt-2 text-xs text-zinc-500">
//               Sconto 10% sul primo ordine dopo l’iscrizione.
//             </p>
//           </div>
//         </div>

//         <div className="mt-10 border-t pt-6 text-xs text-zinc-500 dark:border-zinc-800">
//           Cosmeceutics S.r.l. – Via Udine, 50 — 33010 Tavagnacco — UD — ITALIA —
//           P.I. 02484650300 — REA 264546 — Capitale sociale €10.000,00 i.v.
//         </div>
//       </Container>
//     </footer>
//   );
// }

// export default function SurgicTouchHome() {
//   return (
//     <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
//       <Header />
//       <Hero slides={HERO_SLIDES} />
//       {/* <Actives /> */}
//       <ProductHighlights />
//       <Founders />
//       <Categories />
//       <Method />
//       <CTABand />
//       <FeatureRow />
//       <Partners />
//       <Footer />
//     </main>
//   );
// }

// app/page.tsx
export const revalidate = 60;
import { prisma } from "@/lib/prisma";
import HeroSlide from "@/components/home/Hero";
import Header from "@/components/home/Header";
import CategoryGrid from "@/components/home/Categories";
import CategoryRow from "@/components/home/Categories";
import FooterCustom from "@/components/home/Footer";
import ProductRow from "@/components/home/Production";
import { products_json } from "@/lib/api/api";
// import { SurgicTouchHeader } from "@/components/home/Header";

type PublicHeroSlide = {
  id: string;
  href: string;
  alt: string;
  image: { mobileUrl: string; desktopUrl: string };
  caption?: {
    title?: string | null;
    subtitle?: string | null;
    ctaHref?: string | null;
    ctaLabel?: string | null;
  } | null;
};

async function getHeroSlides(): Promise<PublicHeroSlide[]> {
  const now = new Date();
  const slides = await prisma.heroSlide.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      href: true,
      alt: true,
      image: { select: { mobileUrl: true, desktopUrl: true } },
      caption: {
        select: { title: true, subtitle: true, ctaHref: true, ctaLabel: true },
      },
    },
  });

  return slides.map((s) => ({
    id: s.id,
    href: s.href,
    alt: s.alt,
    image: { mobileUrl: s.image.mobileUrl, desktopUrl: s.image.desktopUrl },
    caption: s.caption
      ? {
          title: s.caption.title ?? null,
          subtitle: s.caption.subtitle ?? null,
          ctaHref: s.caption.ctaHref ?? null,
          ctaLabel: s.caption.ctaLabel ?? null,
        }
      : null,
  }));
}

export default async function HomePage() {
  const slides = await getHeroSlides();
  const heroSlides = slides.map((s) => ({
    ...s,
    image: {
      mobile: s.image.mobileUrl,
      desktop: s.image.desktopUrl,
    },
    caption: s.caption
      ? {
          title: s.caption.title ?? undefined,
          subtitle: s.caption.subtitle ?? undefined,
          ctaHref: s.caption.ctaHref ?? undefined,
          ctaLabel: s.caption.ctaLabel ?? undefined,
        }
      : null,
  }));
  const categories = [
    {
      id: "ckcat001",
      name: "Chăm sóc da mặt",
      slug: "cham-soc-da-mat",
      image: "https://picsum.photos/seed/facecare/600/400",
      imageAlt: "Chăm sóc da mặt",
      description:
        "Làm sạch, cân bằng, dưỡng và phục hồi cho làn da rạng rỡ mỗi ngày.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
    {
      id: "ckcat002",
      name: "Chăm sóc cơ thể",
      slug: "cham-soc-co-the",
      image: "https://picsum.photos/seed/bodycare/600/400",
      imageAlt: "Chăm sóc cơ thể",
      description: "Tẩy tế bào chết, dưỡng ẩm và làm mịn cho làn da toàn thân.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
    {
      id: "ckcat003",
      name: "Trang điểm",
      slug: "trang-diem",
      image: "https://picsum.photos/seed/makeup/600/400",
      imageAlt: "Trang điểm",
      description: "Nền mỏng nhẹ, điểm nhấn tự nhiên cho vẻ đẹp tinh tế.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
    {
      id: "ckcat004",
      name: "Chăm sóc tóc",
      slug: "cham-soc-toc",
      image: "https://picsum.photos/seed/haircare/600/400",
      imageAlt: "Chăm sóc tóc",
      description: "Dầu gội, xả, ủ và treatment phục hồi tóc chắc khỏe.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
    {
      id: "ckcat005",
      name: "Nước hoa",
      slug: "nuoc-hoa",
      image: "https://picsum.photos/seed/perfume/600/400",
      imageAlt: "Nước hoa",
      description: "Hương thơm thanh lịch, bền mùi theo dấu ấn cá nhân.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
    {
      id: "ckcat006",
      name: "Dưỡng thể",
      slug: "duong-the",
      image: "https://picsum.photos/seed/bodylotion/600/400",
      imageAlt: "Dưỡng thể",
      description: "Body lotion, body butter, dầu dưỡng khóa ẩm mịn màng.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
    {
      id: "ckcat007",
      name: "Chống nắng",
      slug: "chong-nang",
      image: "https://picsum.photos/seed/sunscreen/600/400",
      imageAlt: "Chống nắng",
      description: "Bảo vệ da trước UVA/UVB, kết cấu thoáng, không bết dính.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
    {
      id: "ckcat008",
      name: "Mặt nạ",
      slug: "mat-na",
      image: "https://picsum.photos/seed/mask/600/400",
      imageAlt: "Mặt nạ",
      description: "Cấp ẩm tức thì, làm dịu và phục hồi kết cấu da.",
      products: [],
      createdAt: "2025-09-04T10:00:00.000Z",
      updatedAt: "2025-09-04T10:00:00.000Z",
    },
  ];

  console.log(`heroSlide ${heroSlides}`);
  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <Header hero={<HeroSlide slides={heroSlides} />} />
      <CategoryRow categories={categories} />
      <ProductRow products={products_json} title="Sản phẩm nổi bật" />
      <FooterCustom />

    </main>
  );
}
