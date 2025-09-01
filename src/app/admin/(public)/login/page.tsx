// src/app/admin/login/page.tsx
"use client";
import { login } from "./actions"; // ✅ có thể import server action vào client để gán form action
export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await login(formData);
        }}
        className="w-full max-w-sm border rounded-xl p-6 space-y-3"
      >
        <div>
          <label className="block text-sm mb-1">Mật khẩu Admin</label>
          <input
            name="password"
            type="password"
            className="border p-2 w-full rounded"
          />
        </div>
        <button type="submit" className="w-full border rounded p-2">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
