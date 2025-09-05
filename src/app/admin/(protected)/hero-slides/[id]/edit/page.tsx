// src/app/admin/hero-slides/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import HeroForm, { type HeroFormValues } from "@/components/admin/HeroForm";

type Params = { params: { id: string } };

async function getSlide(
  id: string
): Promise<(HeroFormValues & { id: string }) | null> {
  const slide = await prisma.heroSlide.findUnique({
    where: { id },
    include: {
      image: true,
      caption: true,
    },
  });

  if (!slide) return null;

  return {
    id: slide.id,
    href: slide.href,
    alt: slide.alt,
    position: slide.position ?? 0,
    active: slide.active,
    startAt: slide.startAt ? slide.startAt.toISOString() : null,
    endAt: slide.endAt ? slide.endAt.toISOString() : null,
    image: {
      mobileUrl: slide.image.mobileUrl,
      desktopUrl: slide.image.desktopUrl,
    },
    caption: slide.caption
      ? {
          title: slide.caption.title ?? null,
          subtitle: slide.caption.subtitle ?? null,
          ctaHref: slide.caption.ctaHref ?? null,
          ctaLabel: slide.caption.ctaLabel ?? null,
        }
      : undefined, // không có caption -> để undefined cho form
  };
}

export default async function EditHeroSlidePage({ params }: Params) {
  const item = await getSlide(params.id);
  if (!item) return <div className="p-6">Không tìm thấy Hero Slide</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sửa Hero Slide</h1>
      <HeroForm mode="edit" initialData={item} />
    </div>
  );
}
