"use client";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import UploadImage from "@/components/form/UploadImage";

/* ----------------------------- helpers ------------------------------ */
const toNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const urlRegex = /^(https?:\/\/|\/).+/;

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toISOorNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/* ------------------------------ schema ------------------------------ */
const captionSchema = z.object({
  title: z.preprocess(toNull, z.string().nullable()).optional(),
  subtitle: z.preprocess(toNull, z.string().nullable()).optional(),
  ctaHref: z
    .preprocess(toNull, z.string().regex(urlRegex).nullable())
    .optional(),
  ctaLabel: z.preprocess(toNull, z.string().nullable()).optional(),
});

const schema = z.object({
  href: z
    .string()
    .regex(urlRegex, {
      message: 'Link phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"',
    })
    .min(1),
  alt: z.string().min(2, "Alt tối thiểu 2 ký tự"),
  position: z.coerce.number().int().nonnegative().optional(),
  active: z.coerce.boolean().default(true),
  startAt: z.preprocess(toNull, z.string().nullable()).optional(),
  endAt: z.preprocess(toNull, z.string().nullable()).optional(),
  image: z.object({
    mobileUrl: z.string().regex(urlRegex, {
      message: 'Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"',
    }),
    desktopUrl: z.string().regex(urlRegex, {
      message: 'Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"',
    }),
  }),
  caption: captionSchema.optional(),
});

export type HeroFormValues = z.infer<typeof schema>;

type Props =
  | { mode: "create"; initialData?: undefined; onSuccess?: () => void }
  | {
      mode: "edit";
      initialData: HeroFormValues & { id: string };
      onSuccess?: () => void;
    };

/* -------------------------------- FORM -------------------------------- */
export default function HeroForm(props: Props) {
  const { mode, onSuccess } = props;
  const router = useRouter();

  const defaultValues: HeroFormValues = useMemo(
    () =>
      mode === "edit"
        ? props.initialData
        : {
            href: "",
            alt: "",
            active: true,
            position: 0,
            startAt: null,
            endAt: null,
            image: { mobileUrl: "", desktopUrl: "" },
            caption: {
              title: null,
              subtitle: null,
              ctaHref: null,
              ctaLabel: null,
            },
          },
    [mode, props]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HeroFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: HeroFormValues) {
    setServerError(null);

    const url =
      mode === "create"
        ? "/api/hero-slides"
        : `/api/hero-slides/${
            (props as Extract<Props, { mode: "edit" }>).initialData.id
          }`;

    const method = mode === "create" ? "POST" : "PUT";

    const payload: HeroFormValues = {
      ...values,
      startAt: toISOorNull(values.startAt),
      endAt: toISOorNull(values.endAt),
      // caption trống -> gửi null để API có thể bỏ qua
      caption:
        values.caption &&
        !values.caption.title &&
        !values.caption.subtitle &&
        !values.caption.ctaHref &&
        !values.caption.ctaLabel
          ? undefined
          : values.caption,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 409) {
        setServerError("Trùng dữ liệu (vd: vị trí). Vui lòng kiểm tra lại.");
      } else {
        setServerError("Lưu thất bại. Vui lòng thử lại.");
      }
      return;
    }

    if (onSuccess) onSuccess();
    else router.push("/admin/hero-slides");
  }

  /* ------------------------------- watch ------------------------------- */
  const startAt = watch("startAt");
  const endAt = watch("endAt");
  const imageMobile = watch("image.mobileUrl");
  const imageDesktop = watch("image.desktopUrl");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <div className="text-red-600 text-sm">{serverError}</div>}

      {/* Cơ bản */}
      <section className="space-y-3 border rounded-lg p-4">
        <h2 className="font-medium">Cơ bản</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Liên kết (href)</Label>
            <Input
              {...register("href")}
              placeholder="https://... hoặc /duong-dan-noi-bo"
            />
            {errors.href && (
              <p className="text-red-600 text-sm mt-1">
                {errors.href.message as string}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm">Alt</Label>
            <Input {...register("alt")} placeholder="Mô tả ảnh ngắn gọn" />
            {errors.alt && (
              <p className="text-red-600 text-sm mt-1">
                {errors.alt.message as string}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-sm">Vị trí hiển thị (position)</Label>
            <Input
              type="number"
              {...register("position", { valueAsNumber: true })}
            />
            {errors.position && (
              <p className="text-red-600 text-sm mt-1">
                {errors.position.message as string}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-6 md:mt-0">
            <input
              id="active"
              type="checkbox"
              className="scale-110"
              {...register("active")}
            />
            <Label htmlFor="active" className="text-sm">
              Active
            </Label>
          </div>
        </div>
      </section>

      {/* Lịch hiển thị */}
      <section className="space-y-3 border rounded-lg p-4">
        <h2 className="font-medium">Lịch hiển thị</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Bắt đầu (startAt)</Label>
            <Input
              type="datetime-local"
              value={toDatetimeLocalValue(startAt as string | null)}
              onChange={(e) =>
                setValue("startAt", e.currentTarget.value, {
                  shouldValidate: true,
                })
              }
            />
            {errors.startAt && (
              <p className="text-red-600 text-sm mt-1">
                {errors.startAt as unknown as string}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm">Kết thúc (endAt)</Label>
            <Input
              type="datetime-local"
              value={toDatetimeLocalValue(endAt as string | null)}
              onChange={(e) =>
                setValue("endAt", e.currentTarget.value, {
                  shouldValidate: true,
                })
              }
            />
            {errors.endAt && (
              <p className="text-red-600 text-sm mt-1">
                {errors.endAt as unknown as string}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Nếu để trống, slide sẽ không giới hạn thời gian hiển thị.
        </p>
      </section>

      {/* Ảnh */}
      <section className="space-y-3 border rounded-lg p-4">
        <h2 className="font-medium">Ảnh</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <UploadImage
              value={(imageMobile as string) || null}
              onChange={(url) =>
                setValue("image.mobileUrl", url ?? "", { shouldValidate: true })
              }
              label="Ảnh Mobile (tỷ lệ 9:16 gợi ý)"
              helperText='Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"'
            />
            <input type="hidden" {...register("image.mobileUrl")} />
            {errors.image?.mobileUrl && (
              <p className="text-red-600 text-sm mt-1">
                {errors.image.mobileUrl.message as string}
              </p>
            )}
          </div>

          <div>
            <UploadImage
              value={(imageDesktop as string) || null}
              onChange={(url) =>
                setValue("image.desktopUrl", url ?? "", {
                  shouldValidate: true,
                })
              }
              label="Ảnh Desktop (tỷ lệ 16:9 gợi ý)"
              helperText='Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"'
            />
            <input type="hidden" {...register("image.desktopUrl")} />
            {errors.image?.desktopUrl && (
              <p className="text-red-600 text-sm mt-1">
                {errors.image.desktopUrl.message as string}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Caption */}
      <section className="space-y-3 border rounded-lg p-4">
        <h2 className="font-medium">Caption (tuỳ chọn)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Tiêu đề</Label>
            <Input {...register("caption.title")} />
          </div>
          <div>
            <Label className="text-sm">Phụ đề</Label>
            <Input {...register("caption.subtitle")} />
          </div>
          <div>
            <Label className="text-sm">CTA Label</Label>
            <Input {...register("caption.ctaLabel")} />
          </div>
          <div>
            <Label className="text-sm">CTA Href</Label>
            <Input
              {...register("caption.ctaHref")}
              placeholder="https://... hoặc /duong-dan-noi-bo"
            />
            {errors.caption?.ctaHref && (
              <p className="text-red-600 text-sm mt-1">
                {errors.caption.ctaHref.message as string}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="space-y-3 border rounded-lg p-4">
        <h2 className="font-medium">Hành động</h2>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang lưu..."
              : mode === "create"
              ? "Tạo Hero Slide"
              : "Lưu thay đổi"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => history.back()}
          >
            Huỷ
          </Button>
        </div>
      </section>
    </form>
  );
}
