"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

const BRAND = {
  name: "HATHI",
  subtitle: "Nâng niu làn da Việt",
  logoLight: "/logo_cover.png",
  logoDark: "/logo_dark.png",
};

const CONTACT = {
  phone: "+39 0432 502969",
  email: "hathibeautiful@gmail.com",
};

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm Hathi", href: "#hathi-product" },
  { label: "Sản phẩm Surgictouch", href: "#surgictouch-product" },
  { label: "Thông tin", href: "/thong-tin" },
];

const NAV_SECTIONS = [
  {
    title: "EXPLORE",
    items: [
      { label: "Trang chủ", href: "/" },
      { label: "Sản phẩm Hathi", href: "/tipi-di-pelle" },
    ],
  },
  {
    title: "SKINCARE VISO",
    items: [
      { label: "Detergenti", href: "/viso/detergenti" },
      { label: "Sieri", href: "/viso/sieri" },
      { label: "Contorno occhi", href: "/viso/contorno-occhi" },
    ],
  },
];

type HeaderProps = { hero?: React.ReactNode; className?: string };

export default function Header({ hero, className = "" }: HeaderProps) {
  const pathname = usePathname();
  const [solid, setSolid] = React.useState(false);

  const textBase = solid ? "text-foreground" : "text-white";
  const iconBtnDesktop = solid
    ? "hover:bg-muted"
    : "hover:bg-white/10 border-white/30 text-white";

  return (
    <header className={`relative z-50 ${className}`}>
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b">
        <div className="px-3 pt-2 pb-2">
          <div className="grid grid-cols-4 items-center">
            {/* Menu trái */}
            <div className="col-span-1">
              <MobileMenu />
            </div>
            {/* Logo giữa */}
            <div className="flex justify-center col-span-2">
              <Link href="/" className="flex flex-col items-center">
                <Image
                  src={BRAND.logoLight}
                  alt={BRAND.name}
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">
                  {BRAND.subtitle}
                </span>
              </Link>
            </div>
            {/* Cart phải */}
            <div className="flex justify-end col-span-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                className="h-10 w-10"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP HEADER ===== */}
      <div
        className="hidden lg:block absolute inset-x-0 top-0 z-50"
        onMouseEnter={() => setSolid(true)}
        onMouseLeave={() => setSolid(false)}
      >
        {/* nền animate */}
        <div
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 -z-10 origin-top transform-gpu",
            "transition-all duration-300 ease-out",
            "backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
            solid ? "scale-y-100 bg-white/90" : "scale-y-0 bg-white/0",
          ].join(" ")}
        />

        {/* Hàng trên */}
        <div
          className={`px-3 sm:px-4 pt-[calc(env(safe-area-inset-top)+8px)] ${textBase}`}
        >
          <div className="grid grid-cols-3 items-center">
            <div className="grid-cols-1"></div>
            {/* Logo giữa */}
            <div className="flex flex-col items-center justify-center">
              <Link href="/" className="text-center leading-tight">
                <Image
                  src={solid ? BRAND.logoLight : BRAND.logoDark}
                  alt={BRAND.name}
                  width={150}
                  height={150}
                  className="rounded-full"
                />
                <div className="mx-auto mt-1 h-[2px] w-[160px] bg-current/70" />
                <div className="mt-1 text-[11px] tracking-[0.2em] uppercase opacity-90">
                  {BRAND.subtitle}
                </div>
              </Link>
            </div>
            {/* Search + cart phải */}
            <div className="flex items-center justify-end gap-2">
              {/* Search */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 lg:border ${iconBtnDesktop}`}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Tìm kiếm</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Từ khoá…" className="flex-1" />
                    <Button>Tìm</Button>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 lg:border ${iconBtnDesktop}`}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hàng dưới: menu */}
        <DesktopMenu textBase={textBase} pathname={pathname} solid={solid} />
      </div>

      {/* HERO luôn nằm dưới header */}
      <div className="relative">{hero}</div>
    </header>
  );
}

/* Menu Desktop */
function DesktopMenu({
  textBase,
  pathname,
  solid,
}: {
  textBase: string;
  pathname: string;
  solid: boolean;
}) {
  return (
    <div className="px-2 sm:px-4 pb-3 pt-3">
      <nav className={`hidden lg:flex justify-center ${textBase}`}>
        <ul className="flex items-center gap-8 tracking-[0.18em] text-[12px]">
          {NAV_ITEMS.map((it) => {
            const active = pathname === it.href;
            return (
              <li
                key={it.href}
                className={`relative px-2 py-1.5 ${
                  active ? "bg-primary border rounded-full" : "bg-none"
                }`}
              >
                <Link
                  href={it.href}
                  className={`relative z-10 transition-colors px-4 py-1 rounded-full ${
                    active
                      ? solid
                        ? " text-black"
                        : " text-white"
                      : "hover:text-black/70"
                  }`}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/* Menu Mobile */
function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[85vw] max-w-[360px]">
        <div className="p-4 border-b">
          <Link href="/" className="block text-center">
            <div className="font-semibold">{BRAND.name}</div>
            <div className="text-sx tracking-[0.2em] opacity-80">
              {BRAND.subtitle}
            </div>
          </Link>
        </div>
        <div className="p-4">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.title} className="mt-4">
              <div className="font-semibold text-xs">{sec.title}</div>
              <ul>
                {sec.items.map((it) => (
                  <li key={it.href} className="mt-2">
                    <Link href={it.href}>{it.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-6 text-xs text-zinc-500">
            <div>{CONTACT.phone}</div>
            <div>{CONTACT.email}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
