import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

function extFromMime(mime?: string | null) {
  if (!mime) return "";
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  return "";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const remoteUrl = (form.get("url") as string | null)?.trim();
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  let data: ArrayBuffer;
  let originalName = "";
  let guessedExt = "";

  if (file && file.size > 0) {
    data = await file.arrayBuffer();
    originalName = file.name || "upload";
    guessedExt = path.extname(originalName) || extFromMime(file.type) || ".bin";
  } else if (remoteUrl) {
    const resp = await fetch(remoteUrl);
    if (!resp.ok)
      return NextResponse.json(
        { message: "Không tải được URL" },
        { status: 400 }
      );
    data = await resp.arrayBuffer();
    const urlExt = path.extname(new URL(remoteUrl).pathname);
    const ct = resp.headers.get("content-type");
    guessedExt = urlExt || extFromMime(ct) || ".bin";
    originalName = path.basename(new URL(remoteUrl).pathname) || "remote";
  } else {
    return NextResponse.json(
      { message: "Thiếu file hoặc url" },
      { status: 400 }
    );
  }

  // Giới hạn định dạng cơ bản (tùy chọn)
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  if (!allowed.includes(guessedExt.toLowerCase())) {
    return NextResponse.json(
      { message: "Định dạng không hỗ trợ" },
      { status: 415 }
    );
  }

  const id = crypto.randomUUID().replace(/-/g, "");
  const safeName = id + guessedExt.toLowerCase();
  const absPath = path.join(uploadDir, safeName);
  await writeFile(absPath, Buffer.from(new Uint8Array(data)));

  // URL công khai
  const url = `/uploads/${safeName}`;
  return NextResponse.json({ url, filename: safeName, originalName });
}
