// app/api/hero-slides/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const slide = await prisma.heroSlide.create({
      data: {
        href: body.href,
        alt: body.alt,
        position: body.position ?? 0,
        active: body.active ?? true,
        startAt: body.startAt ? new Date(body.startAt) : null,
        endAt: body.endAt ? new Date(body.endAt) : null,

        image: {
          create: {
            mobileUrl: body.image?.mobileUrl,
            desktopUrl: body.image?.desktopUrl,
          },
        },
        ...(body.caption
          ? {
              caption: {
                create: {
                  title: body.caption.title ?? null,
                  subtitle: body.caption.subtitle ?? null,
                  ctaHref: body.caption.ctaHref ?? null, // hoặc map từ ctaText nếu DB cũ
                  ctaLabel: body.caption.ctaLabel ?? null,
                },
              },
            }
          : {}),
      },
      select: { id: true },
    });

    return NextResponse.json({ id: slide.id }, { status: 201 });
  } catch (e: unknown) {
    return new NextResponse((e as Error).message || "Server error", {
      status: 500,
    });
  }
}
