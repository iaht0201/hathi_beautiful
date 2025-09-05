"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft as IconLeft,
  ChevronRight as IconRight,
} from "lucide-react";

export type HeroSlide = {
  id: string | number;
  href: string;
  alt: string;
  image: { mobile: string; desktop: string };
  sort?: number;
  active?: boolean;
  startAt?: string | Date | null;
  endAt?: string | Date | null;
  caption: {
    title?: string;
    subtitle?: string;
    ctaHref?: string;
    ctaLabel?: string;
  } | null;
};

export type HeroProps = {
  slides?: HeroSlide[];
  autoplayMs?: number;
  height?: { mobilePx?: number; desktopVh?: number };
  className?: string;
};

const overlayHex = "#ebb8c0";
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    href: "/pages/i-cosmeceutici",
    alt: "Hathi - beautiful",
    image: {
      mobile:
        "https://surgictouch.com/cdn/shop/files/slide_2_mobile_v10c.png?v=1721383905&width=1800",
      desktop:
        "https://surgictouch.com/cdn/shop/files/slide_3_homepage_v2.png?v=1719822210&width=2400",
    },
    sort: 1,
    caption: {
      title: "Hathi - beautiful",
      subtitle: "Nâng niu làn da Việt",
      ctaHref: "/pages/i-cosmeceutici",
      ctaLabel: "Scopri di più",
    },
  },
  {
    id: 2,
    href: "/pages/i-cosmeceutici",
    alt: "Slide — 2 Cosmeceutici",
    image: {
      mobile:
        "https://surgictouch.com/cdn/shop/files/slide_2_mobile_v10c.png?v=1721383905&width=1800",
      desktop:
        "https://surgictouch.com/cdn/shop/files/slide_3_homepage_v2.png?v=1719822210&width=2400",
    },
    sort: 2,
    caption: {
      title: "Hathi - beautiful",
      subtitle: "Cosmeceutici formulati con principi attivi",
      ctaHref: "/pages/i-cosmeceutici",
      ctaLabel: "Scopri di più",
    },
  },
];

function withinWindow(s: HeroSlide, now = new Date()) {
  const start = s.startAt ? new Date(s.startAt) : null;
  const end = s.endAt ? new Date(s.endAt) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  if (s.active === false) return false;
  return true;
}

export default function Hero({
  slides = DEFAULT_SLIDES,
  autoplayMs = 5000,
  height = { mobilePx: 600, desktopVh: 100 },
  className = "",
}: HeroProps) {
  // Chuẩn bị slides
  const now = new Date();
  const prepared = (slides || [])
    .filter((s) => withinWindow(s, now))
    .sort(
      (a, b) =>
        (a.sort ?? 0) - (b.sort ?? 0) ||
        String(a.id).localeCompare(String(b.id))
    );
  const base = prepared.length ? prepared : DEFAULT_SLIDES;

  // Tạo mảng loop: [last, ...base, first]
  const loopSlides =
    base.length > 1 ? [base[base.length - 1], ...base, base[0]] : base;

  const trackRef = useRef<HTMLDivElement | null>(null);

  // index logic: chỉ tính theo base (0..n-1)
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideCount = base.length;

  // Drag state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  // ===== CSS Animations & helpers =====
  // (đặt trong <style> phía dưới)

  // Đặt vị trí bắt đầu ở slide "thực" đầu tiên = rawIndex = 1
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const snapTo = () => {
      const w = el.clientWidth;
      el.scrollTo({ left: (slideCount > 1 ? 1 : 0) * w, behavior: "auto" });
    };
    snapTo();
    const onResize = () => {
      const w = el.clientWidth;
      el.scrollTo({
        left: ((slideCount > 1 ? 1 : 0) + index) * w,
        behavior: "auto",
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCount]);

  // Đồng bộ index khi scroll + xử lý loop nhảy không giật
  useEffect(() => {
    const el = trackRef.current;
    if (!el || slideCount <= 1) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const w = el.clientWidth;
        const raw = Math.round(el.scrollLeft / Math.max(1, w)); // 0..n+1
        const n = slideCount;

        // Nếu chạm clone trái (0) → nhảy sang slide cuối (raw = n)
        if (raw === 0) {
          const prevBehavior = el.style.scrollBehavior;
          el.style.scrollBehavior = "auto";
          el.scrollTo({ left: n * w });
          el.style.scrollBehavior = prevBehavior;
          setIndex(n - 1);
          ticking = false;
          return;
        }
        // Nếu chạm clone phải (n+1) → nhảy sang slide đầu (raw = 1)
        if (raw === n + 1) {
          const prevBehavior = el.style.scrollBehavior;
          el.style.scrollBehavior = "auto";
          el.scrollTo({ left: 1 * w });
          el.style.scrollBehavior = prevBehavior;
          setIndex(0);
          ticking = false;
          return;
        }

        // raw 1..n → logical 0..n-1
        const logical = (((raw - 1) % n) + n) % n;
        if (logical !== index) setIndex(logical);
        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [index, slideCount]);

  // Autoplay (tôn trọng loop)
  useEffect(() => {
    if (!autoplayMs || paused || slideCount <= 1) return;
    const el = trackRef.current;
    if (!el) return;

    const id = setInterval(() => {
      go(index + 1);
    }, Math.max(1500, autoplayMs));

    return () => clearInterval(id);
  }, [index, paused, slideCount, autoplayMs]);

  // Điều hướng tới index logic (0..n-1), map sang raw = logical + 1
  function go(to: number) {
    const el = trackRef.current;
    if (!el || slideCount <= 1) return;
    const n = slideCount;
    const logical = ((to % n) + n) % n;
    const rawTarget = logical + 1; // vì có clone đầu
    const w = el.clientWidth;
    el.scrollTo({ left: rawTarget * w, behavior: "smooth" });
    setIndex(logical);
  }

  // ===== Mouse drag to scroll =====
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    el.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    // tạm tắt smooth để kéo tay không bị khựng
    el.style.scrollBehavior = "auto";
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el || !isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    el.scrollLeft = startScrollLeftRef.current - dx;
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el) return;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      // bật lại smooth để snap
      el.style.scrollBehavior = "";
      // Snap thủ công về gần slide
      const w = el.clientWidth;
      const raw = Math.round(el.scrollLeft / Math.max(1, w));
      el.scrollTo({ left: raw * w, behavior: "smooth" });
    }
  }
  function onPointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    onPointerUp(e as React.PointerEvent<HTMLDivElement>);
  }

  const mobileH = height.mobilePx ?? 600;
  const desktopVh = height.desktopVh ?? 100;
  const styleVars = {
    "--hero-h-mobile": `${mobileH}px`,
    "--hero-h-desktop": `${desktopVh}vh`,
  } as React.CSSProperties;

  return (
    <section
      className={`relative overflow-hidden w-full ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* ✨ Animation keyframes & helpers */}

      {/* style */}
      {/* Track (loop + drag) */}
      <div
        ref={trackRef}
        className={
          "relative z-10 flex h-[var(--hero-h-mobile)] sm:h-[var(--hero-h-desktop)] snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] cursor-grab active:cursor-grabbing select-none no-img-drag"
        }
        style={{ WebkitOverflowScrolling: "touch", ...styleVars }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Hero slideshow"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>

        {loopSlides.map((s, idx) => {
          // rawIndex → active nếu map về logical index trùng state `index`
          let isActive = false;
          if (slideCount <= 1) isActive = true;
          else {
            const n = slideCount;
            const raw = idx; // 0..n+1
            if (raw >= 1 && raw <= n) {
              const logical = (((raw - 1) % n) + n) % n;
              isActive = logical === index;
            }
          }

          return (
            <div
              key={`hero-${idx}-${s.id}`}
              className={
                `hide-scrollbar relative h-full min-w-full shrink-0 snap-start ` +
                (isActive ? "hero-slide--active" : "hero-slide--idle")
              }
              aria-roledescription="slide"
              aria-label={s.alt}
            >
              {/* Mobile image */}
              <div className="absolute inset-0 sm:hidden">
                <Image
                  src={s.image.mobile}
                  alt={s.alt}
                  fill
                  priority={idx === 1 /* slide thực đầu tiên */}
                  className="hero-img object-cover object-center"
                  sizes="100vw"
                  draggable={false}
                />
              </div>
              {/* Desktop image */}
              <div className="absolute inset-0 hidden sm:block">
                <Image
                  src={s.image.desktop}
                  alt={s.alt}
                  fill
                  priority={idx === 1}
                  className="hero-img object-cover object-center"
                  sizes="100vw"
                  draggable={false}
                />
              </div>

              {/* Pink overlay */}
              <div
                className="absolute inset-0 mix-blend-multiply transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: overlayHex, opacity: 0.4 }}
              />

              {/* Clickable overlay */}
              <a
                href={s.href}
                className="absolute inset-0 z-10"
                aria-label={s.alt}
              />

              {/* Caption */}
              {s.caption && (
                <div
                  className="hero-caption absolute z-20 left-5 sm:left-10 bottom-6 sm:bottom-20
             flex flex-col items-start justify-end text-start text-white px-4"
                >
                  {s.caption.title && (
                    <h1 className="text-3xl font-bold sm:text-5xl">
                      {s.caption.title}
                    </h1>
                  )}
                  {s.caption.subtitle && (
                    <p className="mt-4 max-w-lg text-base sm:text-lg">
                      {s.caption.subtitle}
                    </p>
                  )}
                  {s.caption.ctaHref && s.caption.ctaLabel && (
                    <a
                      href={s.caption.ctaHref}
                      className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium backdrop-blur hover:bg-black/80 active:scale-[0.99] transition"
                    >
                      {s.caption.ctaLabel}
                      <IconRight className="ml-1 h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {slideCount > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border bg-white/70 p-2 backdrop-blur transition hover:bg-white active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <IconLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border bg-white/70 p-2 backdrop-blur transition hover:bg-white active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <IconRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots (theo index logic 0..n-1) */}
      {slideCount > 1 && (
        <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-white/70 p-1 backdrop-blur dark:bg-zinc-900/60">
            {base.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i)}
                className={"dot " + (index === i ? "dot--active" : "dot--idle")}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
