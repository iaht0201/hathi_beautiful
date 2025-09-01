"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/(protected)/products/actions";

export default function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Xoá sản phẩm?")) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteProduct(fd); // server action
    });
  }

  return (
    <button
      type="button"
      className="text-red-600 underline"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
