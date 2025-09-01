"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 kí tự"),
  description: z.string().optional(), // API sẽ tự bỏ qua nếu DB không có cột
});
type FormValues = z.infer<typeof schema>;

export default function CreateCategoryForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.status === 409) {
      setServerError("Tên/slug đã tồn tại.");
      return;
    }
    if (!res.ok) {
      setServerError("Tạo danh mục thất bại.");
      return;
    }

    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-md">
      {serverError && <div className="text-sm text-red-600">{serverError}</div>}
      <div>
        <Label className="text-sm">Tên danh mục</Label>
        <Input placeholder="VD: Serum, Cleanser..." {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label className="text-sm">Mô tả (tuỳ chọn)</Label>
        <Input placeholder="Mô tả ngắn..." {...register("description")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo danh mục"}
      </Button>
    </form>
  );
}
