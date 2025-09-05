// src/app/api/hero-slides/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/* ------------------------------ schema ------------------------------ */
const ImageSchema = z.object({
  mobileUrl: z.string().min(1),
  desktopUrl: z.string().min(1),
});

const CaptionSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
});

const BodySchema = z.object({
  href: z.string().min(1).optional(),
  alt: z.string().min(1).optional(),
  position: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  image: ImageSchema.optional(),
  caption: z.union([CaptionSchema, z.null()]).optional(),
});

/* ------------------------------ helpers ----------------------------- */
function toDateTri(v: string | null | undefined): Date | null | undefined {
  if (v === undefined) return undefined; // giữ nguyên
  if (v === null) return null; // set null
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/* -------------------------------- PUT -------------------------------- */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.message },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const current = await prisma.heroSlide.findUnique({
    where: { id },
    include: {
      image: { select: { id: true } },
      caption: { select: { id: true } },
    },
  });
  if (!current) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const data: Prisma.HeroSlideUpdateInput = {};

  if (body.href !== undefined) data.href = body.href;
  if (body.alt !== undefined) data.alt = body.alt;
  if (body.position !== undefined) data.position = body.position;
  if (body.active !== undefined) data.active = body.active;

  const startAt = toDateTri(body.startAt);
  if (startAt !== undefined) data.startAt = startAt;

  const endAt = toDateTri(body.endAt);
  if (endAt !== undefined) data.endAt = endAt;

  // Image ops: kiểu chính xác cho nested relation
  if (body.image !== undefined) {
    const imageOp: Prisma.ImageSlideUpdateOneRequiredWithoutHeroSlideNestedInput =
      current.image?.id
        ? {
            update: {
              mobileUrl: body.image.mobileUrl,
              desktopUrl: body.image.desktopUrl,
            },
          }
        : {
            create: {
              mobileUrl: body.image.mobileUrl,
              desktopUrl: body.image.desktopUrl,
            },
          };

    data.image = imageOp;
  }

  // Caption ops
  const oldCaptionId = current.caption?.id ?? null;
  let shouldTryDeleteOldCaption = false;

  if (body.caption !== undefined) {
    if (body.caption === null) {
      if (oldCaptionId) {
        const captionOp: Prisma.CaptionHeroSlideUpdateOneWithoutHeroSlideNestedInput =
          { disconnect: true };
        data.caption = captionOp;
        shouldTryDeleteOldCaption = true;
      }
    } else {
      const cap = body.caption;
      const emptyCap =
        !cap.title && !cap.subtitle && !cap.ctaHref && !cap.ctaLabel;

      if (emptyCap) {
        if (oldCaptionId) {
          const captionOp: Prisma.CaptionHeroSlideUpdateOneWithoutHeroSlideNestedInput =
            { disconnect: true };
          data.caption = captionOp;
          shouldTryDeleteOldCaption = true;
        }
      } else {
        const captionOp: Prisma.CaptionHeroSlideUpdateOneWithoutHeroSlideNestedInput =
          oldCaptionId
            ? {
                update: {
                  title: cap.title ?? null,
                  subtitle: cap.subtitle ?? null,
                  ctaHref: cap.ctaHref ?? null,
                  ctaLabel: cap.ctaLabel ?? null,
                },
              }
            : {
                create: {
                  title: cap.title ?? null,
                  subtitle: cap.subtitle ?? null,
                  ctaHref: cap.ctaHref ?? null,
                  ctaLabel: cap.ctaLabel ?? null,
                },
              };
        data.caption = captionOp;
      }
    }
  }

  const updated = await prisma.heroSlide.update({
    where: { id },
    data,
    select: {
      id: true,
      href: true,
      alt: true,
      position: true,
      active: true,
      startAt: true,
      endAt: true,
      image: { select: { mobileUrl: true, desktopUrl: true } },
      caption: {
        select: { title: true, subtitle: true, ctaHref: true, ctaLabel: true },
      },
      updatedAt: true,
    },
  });

  // cleanup caption rác nếu vừa disconnect
  if (shouldTryDeleteOldCaption && oldCaptionId) {
    try {
      const cnt = await prisma.heroSlide.count({
        where: { captionId: oldCaptionId },
      });
      if (cnt === 0) {
        await prisma.captionHeroSlide.delete({ where: { id: oldCaptionId } });
      }
    } catch {
      // bỏ qua lỗi dọn dẹp
    }
  }

  return NextResponse.json(updated);
}
