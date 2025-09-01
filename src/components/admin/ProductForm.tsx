"use client";

import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import UploadImage from "@/components/form/UploadImage"; // component tái sử dụng
import { slugify } from "@/utils/slugify";
import { makeProductSeo } from "@/utils/seo";
import type { Option } from "@/types/product";

/* ----------------------------- helpers ------------------------------ */
const toNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const urlRegex = /^(https?:\/\/|\/).+/;

/* ----------------------------- schema ------------------------------ */
const schema = z.object({
  /* cơ bản */
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.preprocess(toNull, z.string().min(1).nullable()).optional(),

  /* giá & tồn */
  price: z.coerce.number().int().nonnegative(),
  compareAtPrice: z
    .preprocess(toNull, z.coerce.number().int().nonnegative().nullable())
    .optional(),
  stock: z.coerce.number().int().nonnegative().default(0),

  /* media (đã thêm images[]) */
  imageUrl: z
    .preprocess(
      toNull,
      z
        .string()
        .regex(urlRegex, {
          message: 'Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"',
        })
        .nullable()
    )
    .optional(),
  images: z
    .array(
      z.string().regex(urlRegex, {
        message: 'Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"',
      })
    )
    .optional()
    .default([]),

  /* liên kết */
  brandId: z.preprocess(toNull, z.string().min(1).nullable()).optional(),
  categoryId: z.preprocess(toNull, z.string().min(1).nullable()).optional(),

  /* nội dung / chi tiết */
  shortDescription: z.preprocess(toNull, z.string().nullable()).optional(),
  description: z.preprocess(toNull, z.string().nullable()).optional(),
  ingredients: z.preprocess(toNull, z.string().nullable()).optional(),
  usage: z.preprocess(toNull, z.string().nullable()).optional(),
  volume: z.preprocess(toNull, z.string().nullable()).optional(),
  volumeUnit: z.preprocess(toNull, z.string().nullable()).optional(),
  origin: z.preprocess(toNull, z.string().nullable()).optional(),

  /* hiển thị */
  isFeatured: z.coerce.boolean().optional(),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
  publishedAt: z.preprocess(toNull, z.string().nullable()).optional(), // ISO string

  /* SEO */
  metaTitle: z.preprocess(toNull, z.string().nullable()).optional(),
  metaDescription: z.preprocess(toNull, z.string().nullable()).optional(),
});

export type ProductFormValues = z.infer<typeof schema>;

type Props =
  | { mode: "create"; initialData?: undefined }
  | { mode: "edit"; initialData: ProductFormValues & { id: string } };

/* ---------------- Quick Create Dialog (Brand/Category) ---------------- */
function QuickCreateDialog({
  open,
  onOpenChange,
  type,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: "brand" | "category";
  onCreated: (opt: { id: string; name: string }) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const n = name.trim();
    if (!n) return;
    setLoading(true);
    const res = await fetch(
      `/api/${type === "brand" ? "brands" : "categories"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, description: desc || null }),
      }
    );
    setLoading(false);
    if (!res.ok) {
      const txt = await res.text();
      alert(txt || "Tạo thất bại");
      return;
    }
    const data = (await res.json()) as { id: string; name: string };
    onCreated(data);
    setName("");
    setDesc("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Tạo {type === "brand" ? "Hãng" : "Danh mục"} mới
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Tên</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Tên ${type}`}
            />
          </div>
          <div>
            <Label className="text-sm">Mô tả (tuỳ chọn)</Label>
            <Textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- Page -------------------------------- */
export default function ProductForm(props: Props) {
  const { mode } = props;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit"
        ? props.initialData
        : {
            price: 0,
            stock: 0,
            status: "PUBLISHED",
            publishedAt: new Date().toISOString(),
            isFeatured: false,
            images: [],
          },
  });

  /* ====== Slug auto-sync (khóa khi user sửa tay) ====== */
  const slugLockedRef = useRef(false);
  useEffect(() => {
    if (mode === "edit") slugLockedRef.current = true;
  }, [mode]);

  const nameVal = watch("name") || "";
  useEffect(() => {
    if (!slugLockedRef.current) {
      setValue("slug", slugify(nameVal), { shouldValidate: true });
    }
  }, [nameVal, setValue]);

  const slugReg = register("slug");
  const nameReg = register("name");

  /* ====== Lists (brand/category) ====== */
  const [brands, setBrands] = useState<Option[]>([]);
  const [cats, setCats] = useState<Option[]>([]);
  const [openBrand, setOpenBrand] = useState(false);
  const [openCat, setOpenCat] = useState(false);

  useEffect(() => {
    (async () => {
      const [b, c] = await Promise.all([
        fetch("/api/brands").then((r) => r.json() as Promise<Option[]>),
        fetch("/api/categories").then((r) => r.json() as Promise<Option[]>),
      ]);
      setBrands(b);
      setCats(c);
    })();
  }, []);

  /* ====== Server save ====== */
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function normalizePublishedAt(v?: string | null) {
    if (!v) return null;
    // Nếu là giá trị từ <input type="datetime-local"> thì convert sang ISO
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  async function onSubmit(values: ProductFormValues) {
    setSaving(true);
    setServerError(null);

    const url =
      mode === "create"
        ? "/api/products"
        : `/api/products/${
            (props as Extract<Props, { mode: "edit" }>).initialData.id
          }`;
    const method = mode === "create" ? "POST" : "PUT";

    const payload: ProductFormValues = {
      ...values,
      publishedAt: normalizePublishedAt(values.publishedAt),
      // đảm bảo images không có chuỗi rỗng
      images: (values.images || []).filter(Boolean),
    } as ProductFormValues;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.status === 409) {
      setServerError("Slug đã tồn tại, vui lòng đổi.");
      return;
    }
    if (!res.ok) {
      setServerError("Lỗi lưu dữ liệu.");
      return;
    }
    router.push("/admin/products");
  }

  /* ====== SEO autofill ====== */
  function autofillSeoFromContent() {
    const v = getValues();
    const gen = makeProductSeo({
      name: v.name,
      brandName: v.brandId
        ? brands.find((b) => b.id === v.brandId)?.name
        : undefined,
      categoryName: v.categoryId
        ? cats.find((c) => c.id === v.categoryId)?.name
        : undefined,
      shortDescription: v.shortDescription ?? undefined,
      description: v.description ?? undefined,
      volume: v.volume ?? undefined,
    });
    if (gen.metaTitle) setValue("metaTitle", gen.metaTitle);
    if (gen.metaDescription) setValue("metaDescription", gen.metaDescription);
  }

  /* ====== Image values from form ====== */
  const imageUrl = (watch("imageUrl") as string | null) ?? null;
  const images = (watch("images") as string[] | undefined) || [];

  function updateImageAt(index: number, url: string | null) {
    const next = [...images];
    if (url) next[index] = url;
    else next.splice(index, 1);
    setValue("images", next, { shouldValidate: true, shouldDirty: true });
  }

  function addEmptyImageSlot() {
    setValue("images", [...images, ""], { shouldDirty: true });
  }

  function removeImageAt(index: number) {
    const next = images.filter((_, i) => i !== index);
    setValue("images", next, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="text-red-600 text-sm">{serverError}</div>
        )}

        {/* 2 cột 1/2 – 1/2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: nội dung chính */}
          <div className="space-y-6 ">
            {/* Cơ bản */}
            <section className="space-y-3 border rounded-lg p-4">
              <h2 className="font-medium">Thông tin cơ bản</h2>

              <div>
                <label className="block text-sm mb-1">Tên sản phẩm</label>
                <Input
                  {...nameReg}
                  onChange={(e) => {
                    nameReg.onChange(e);
                  }}
                  placeholder="VD: Serum Dưỡng Ẩm 30ml"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Slug</label>
                  <Input
                    id="slug"
                    {...slugReg}
                    onChange={(e) => {
                      slugLockedRef.current = true;
                      slugReg.onChange(e);
                    }}
                    onBlur={(e) => {
                      if (!e.currentTarget.value.trim()) {
                        slugLockedRef.current = false;
                        setValue("slug", slugify(nameVal), {
                          shouldValidate: true,
                        });
                      }
                    }}
                    placeholder="serum-duong-am-30ml"
                  />
                  {errors.slug && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1">SKU</label>
                  <Input {...register("sku")} placeholder="VD: ST-30ML-A1" />
                  {errors.sku && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.sku as unknown as string}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Giá & Tồn */}
            <section className="space-y-3 border rounded-lg p-4">
              <h2 className="font-medium">Giá & Tồn kho</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Giá (₫)</label>
                  <Input type="number" {...register("price")} />
                  {errors.price && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Giá cũ (tuỳ chọn)
                  </label>
                  <Input type="number" {...register("compareAtPrice")} />
                  {errors.compareAtPrice && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.compareAtPrice as unknown as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">Tồn kho</label>
                  <Input type="number" {...register("stock")} />
                  {errors.stock && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Ảnh – ảnh chính + gallery */}
            <section className="space-y-3 border rounded-lg p-4">
              <h2 className="font-medium">Ảnh sản phẩm</h2>

              {/* Ảnh chính */}
              <UploadImage
                value={imageUrl}
                onChange={(url) =>
                  setValue("imageUrl", url, { shouldValidate: true })
                }
                label="Ảnh chính"
                helperText='Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"'
              />
              {/* đảm bảo field được register để vào payload */}
              <input type="hidden" {...register("imageUrl")} />
              {errors.imageUrl && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.imageUrl as unknown as string}
                </p>
              )}

              {/* Gallery phụ */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Thư viện ảnh (tuỳ chọn)</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addEmptyImageSlot}
                  >
                    + Thêm ảnh
                  </Button>
                </div>
                {images.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Chưa có ảnh nào.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <UploadImage
                        value={img || null}
                        onChange={(url) => updateImageAt(idx, url)}
                        label={`Ảnh #${idx + 1}`}
                        helperText='Ảnh phải là http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/"'
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeImageAt(idx)}
                        >
                          Xoá
                        </Button>
                      </div>
                      {/* đăng ký từng phần tử để đảm bảo có trong payload */}
                      <input
                        type="hidden"
                        {...register(`images.${idx}` as const)}
                        value={img}
                        readOnly
                      />
                    </div>
                  ))}
                </div>
                {errors.images && (
                  <p className="text-red-600 text-sm mt-1">
                    {(errors.images as unknown as string) || "Lỗi thư viện ảnh"}
                  </p>
                )}
              </div>
            </section>

            {/* Liên kết */}
            {/* <section className="space-y-3 border rounded-lg p-4">
              <h2 className="font-medium">Liên kết</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Hãng</label>
                  <div className="flex gap-2">
                    <select
                      className="border rounded p-2 w-full"
                      {...register("brandId", {
                        setValueAs: (v) => (v === "" ? null : v),
                      })}
                    >
                      <option value="">-- Không --</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenBrand(true)}
                    >
                      + Thêm
                    </Button>
                  </div>
                  {errors.brandId && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.brandId as unknown as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1">Danh mục</label>
                  <div className="flex gap-2">
                    <select
                      className="border rounded p-2 w-full"
                      {...register("categoryId")}
                      defaultValue=""
                    >
                      <option value="">-- Không --</option>
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenCat(true)}
                    >
                      + Thêm
                    </Button>
                  </div>
                  {errors.categoryId && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.categoryId as unknown as string}
                    </p>
                  )}
                </div>
              </div>
            </section> */}
            <section className="space-y-3 border rounded-lg p-4">
              <h2 className="font-medium">Liên kết</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* BRAND */}
                <div>
                  <label className="block text-sm mb-1">Hãng</label>
                  <div className="flex gap-2">
                    <Controller
                      name="brandId"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="border rounded p-2 w-full"
                          value={field.value ?? ""} // null -> ""
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          } // "" -> null
                        >
                          <option value="">-- Không --</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenBrand(true)}
                    >
                      + Thêm
                    </Button>
                  </div>
                  {errors.brandId && (
                    <p className="text-red-600 text-sm mt-1">
                      {String(errors.brandId.message ?? "")}
                    </p>
                  )}
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="block text-sm mb-1">Danh mục</label>
                  <div className="flex gap-2">
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="border rounded p-2 w-full"
                          value={field.value ?? ""} // null -> ""
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          } // "" -> null
                        >
                          <option value="">-- Không --</option>
                          {cats.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenCat(true)}
                    >
                      + Thêm
                    </Button>
                  </div>
                  {errors.categoryId && (
                    <p className="text-red-600 text-sm mt-1">
                      {String(errors.categoryId.message ?? "")}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Chi tiết */}
            <section className="space-y-3 border rounded-lg p-4">
              <h2 className="font-medium">Chi tiết</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Mô tả ngắn</label>
                  <Textarea rows={3} {...register("shortDescription")} />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Dung tích / Quy cách
                  </label>
                  <Input {...register("volume")} placeholder="VD: 30" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Đơn vị dung tích</label>
                  <select
                    className="border rounded p-2 w-full"
                    {...register("volumeUnit")}
                    defaultValue=""
                  >
                    <option value="">-- Không --</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Xuất xứ</label>
                  <Input {...register("origin")} placeholder="VD: Hàn Quốc" />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Mô tả chi tiết</label>
                <Textarea rows={6} {...register("description")} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Thành phần</label>
                  <Textarea rows={4} {...register("ingredients")} />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Hướng dẫn sử dụng
                  </label>
                  <Textarea rows={4} {...register("usage")} />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: sidebar (sticky) */}
          <aside>
            <div className="lg:sticky lg:top-4 space-y-6">
              {/* Hiển thị */}
              <section className="space-y-3 border rounded-lg p-4">
                <h2 className="font-medium">Hiển thị</h2>

                <div className="flex items-center gap-2">
                  <input
                    id="isFeatured"
                    type="checkbox"
                    className="scale-110"
                    {...register("isFeatured")}
                  />
                  <Label htmlFor="isFeatured" className="text-sm">
                    Nổi bật
                  </Label>
                </div>

                <div>
                  <label className="block text-sm mb-1">Trạng thái</label>
                  <select
                    className="border rounded p-2 w-full"
                    {...register("status")}
                  >
                    <option value="PUBLISHED">ĐANG BÁN</option>
                    <option value="DRAFT">NHÁP</option>
                    <option value="ARCHIVED">NGỪNG BÁN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Ngày đăng bán</label>
                  <Input
                    type="datetime-local"
                    value={toDatetimeLocalValue(watch("publishedAt"))}
                    onChange={(e) =>
                      setValue("publishedAt", e.currentTarget.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {errors.publishedAt && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.publishedAt as unknown as string}
                    </p>
                  )}
                </div>
              </section>

              {/* SEO */}
              <section className="space-y-3 border rounded-lg p-4">
                <h2 className="font-medium">SEO</h2>

                <div>
                  <label className="block text-sm mb-1">Tiêu đề SEO</label>
                  <Input {...register("metaTitle")} />
                </div>

                <div>
                  <label className="block text-sm mb-1">Mô tả SEO</label>
                  <Textarea rows={4} {...register("metaDescription")} />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={autofillSeoFromContent}
                >
                  Tự điền từ nội dung
                </Button>
              </section>

              {/* Actions */}
              <section className="space-y-3 border rounded-lg p-4">
                <h2 className="font-medium">Hành động</h2>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Đang lưu..."
                      : mode === "create"
                      ? "Tạo mới"
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
            </div>
          </aside>
        </div>

        {/* Dialogs tạo nhanh */}
        <QuickCreateDialog
          open={openBrand}
          onOpenChange={setOpenBrand}
          type="brand"
          onCreated={(opt) => {
            setBrands((prev) => [...prev, opt]);
            setValue("brandId", opt.id, { shouldValidate: true });
          }}
        />
        <QuickCreateDialog
          open={openCat}
          onOpenChange={setOpenCat}
          type="category"
          onCreated={(opt) => {
            setCats((prev) => [...prev, opt]);
            setValue("categoryId", opt.id, { shouldValidate: true });
          }}
        />
      </form>
    </div>
  );
}
