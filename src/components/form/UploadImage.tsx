"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type UploadImageProps = {
  /** URL hiện tại của ảnh (hoặc null nếu chưa có) */
  value: string | null | undefined;
  /** Callback sau khi chọn / xoá ảnh */
  onChange: (url: string | null) => void;
  /** API upload, default: /api/upload (trả { url: string }) */
  uploadUrl?: string;
  /** Nhãn hiển thị (tuỳ chọn) */
  label?: string;
  /** Gợi ý/ghi chú nhỏ (tuỳ chọn) */
  helperText?: string;
  /** Tắt tương tác */
  disabled?: boolean;
  /** className ngoài cùng */
  className?: string;
  /** className cho khối preview */
  previewClassName?: string;
  /** Cho phép loại file (mặc định image/*) */
  accept?: string;
};

export default function UploadImage({
  value,
  onChange,
  uploadUrl = "/api/upload",
  label = "Ảnh sản phẩm",
  helperText,
  disabled,
  className = "",
  previewClassName = "",
  accept = "image/*",
}: UploadImageProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(uploadUrl, { method: "POST", body: fd });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload thất bại");
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Upload thất bại");
    } finally {
      setUploading(false);
      // reset input để có thể chọn lại cùng 1 file liên tiếp
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function triggerChoose() {
    if (disabled) return;
    fileRef.current?.click();
  }

  function clear() {
    if (disabled) return;
    onChange(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {label && <h3 className="font-medium mb-3">{label}</h3>}

      <div className={`space-y-3 ${previewClassName}`}>
        {value ? (
          <div className="flex items-center gap-3">
            {/* preview */}
            <Image
              src={value}
              alt="preview"
              width={112}
              height={112}
              className="object-cover rounded border"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={triggerChoose}
                disabled={disabled || uploading}
              >
                {uploading ? "Đang xử lý…" : "Đổi ảnh"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clear}
                disabled={disabled || uploading}
              >
                Xoá
              </Button>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="underline text-sm"
              >
                Mở ảnh
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={triggerChoose}
              disabled={disabled || uploading}
            >
              {uploading ? "Đang xử lý…" : "Chọn ảnh…"}
            </Button>
          </div>
        )}

        {/* hidden input */}
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    </div>
  );
}
