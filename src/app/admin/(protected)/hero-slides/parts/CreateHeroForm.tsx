"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ---- Schema (đúng với HeroSlide + caption trong từng slide)
const urlOrPath = z
  .string()
  .min(1, "Bắt buộc")
  .refine(
    (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
    "Nhập URL hợp lệ (http/https) hoặc path bắt đầu bằng /"
  );

const schema = z.object({
  // slide core
  href: urlOrPath, // link khi click
  alt: z.string().min(2, "Mô tả ảnh tối thiểu 2 kí tự"),
  mobileUrl: z.string().url("URL ảnh mobile không hợp lệ"),
  desktopUrl: z.string().url("URL ảnh desktop không hợp lệ"),
  position: z.coerce.number().int().min(0, "Vị trí ≥ 0").default(0),
  active: z.coerce.boolean().default(true),

  // lịch hiển thị
  startAt: z.string().optional(), // datetime-local (API sẽ parse)
  endAt: z.string().optional(), // datetime-local

  // overlay màu (nếu DB chưa có cột thì API có thể bỏ qua)
  overlayHex: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Màu hex (#RGB hoặc #RRGGBB)")
    .optional()
    .default("#ebb8c0"),

  // caption trong slide
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaHref: z.string().optional(),
  ctaLabel: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateHeroForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: true,
      position: 0,
      overlayHex: "#ebb8c0",
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const payload = {
      href: values.href,
      alt: values.alt,
      position: values.position,
      active: values.active,
      startAt: values.startAt ? new Date(values.startAt).toISOString() : null,
      endAt: values.endAt ? new Date(values.endAt).toISOString() : null,
      overlayHex: values.overlayHex,
      image: {
        mobileUrl: values.mobileUrl,
        desktopUrl: values.desktopUrl,
      },
      caption:
        values.title || values.subtitle || values.ctaHref || values.ctaLabel
          ? {
              title: values.title || null,
              subtitle: values.subtitle || null,
              ctaHref: values.ctaHref || null,
              ctaLabel: values.ctaLabel || null,
            }
          : null,
    };

    const res = await fetch("/api/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      setServerError("Slide trùng (href/vị trí hoặc dữ liệu unique khác).");
      return;
    }
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      setServerError(msg || "Tạo slide thất bại.");
      return;
    }

    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      {serverError && <div className="text-sm text-red-600">{serverError}</div>}

      {/* Link đích & ALT */}
      <div>
        <Label className="text-sm">Href (URL hoặc /path)</Label>
        <Input placeholder="/pages/i-cosmeceutici" {...register("href")} />
        {errors.href && (
          <p className="text-sm text-red-600 mt-1">{errors.href.message}</p>
        )}
      </div>

      <div>
        <Label className="text-sm">ALT (mô tả ảnh)</Label>
        <Input placeholder="Hero — I Cosmeceutici" {...register("alt")} />
        {errors.alt && (
          <p className="text-sm text-red-600 mt-1">{errors.alt.message}</p>
        )}
      </div>

      {/* Ảnh mobile/desktop */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Mobile image URL</Label>
          <Input
            placeholder="https://…/mobile.png"
            {...register("mobileUrl")}
          />
          {errors.mobileUrl && (
            <p className="text-sm text-red-600 mt-1">
              {errors.mobileUrl.message}
            </p>
          )}
        </div>
        <div>
          <Label className="text-sm">Desktop image URL</Label>
          <Input
            placeholder="https://…/desktop.png"
            {...register("desktopUrl")}
          />
          {errors.desktopUrl && (
            <p className="text-sm text-red-600 mt-1">
              {errors.desktopUrl.message}
            </p>
          )}
        </div>
      </div>

      {/* Overlay & trạng thái */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm">Overlay màu (hex)</Label>
          <Input
            type="text"
            placeholder="#ebb8c0"
            {...register("overlayHex")}
          />
          {errors.overlayHex && (
            <p className="text-sm text-red-600 mt-1">
              {errors.overlayHex.message}
            </p>
          )}
        </div>
        <div>
          <Label className="text-sm">Vị trí (sort)</Label>
          <Input
            type="number"
            min={0}
            {...register("position", { valueAsNumber: true })}
          />
          {errors.position && (
            <p className="text-sm text-red-600 mt-1">
              {errors.position.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="active" type="checkbox" {...register("active")} />
          <Label htmlFor="active" className="text-sm">
            Active
          </Label>
        </div>
      </div>

      {/* Lịch hiển thị */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Start at</Label>
          <Input type="datetime-local" {...register("startAt")} />
        </div>
        <div>
          <Label className="text-sm">End at</Label>
          <Input type="datetime-local" {...register("endAt")} />
        </div>
      </div>

      {/* Caption */}
      <div className="rounded-lg border p-3 space-y-3">
        <div>
          <Label className="text-sm">Tiêu đề</Label>
          <Input
            placeholder="It’s not miracle — it’s science."
            {...register("title")}
          />
        </div>
        <div>
          <Label className="text-sm">Mô tả ngắn</Label>
          <Input placeholder="Cosmeceutici…" {...register("subtitle")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">CTA href</Label>
            <Input
              placeholder="/pages/i-cosmeceutici"
              {...register("ctaHref")}
            />
          </div>
          <div>
            <Label className="text-sm">CTA label</Label>
            <Input placeholder="Scopri di più" {...register("ctaLabel")} />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo hero slide"}
      </Button>
    </form>
  );
}
