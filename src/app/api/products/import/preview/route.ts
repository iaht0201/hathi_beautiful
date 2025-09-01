// src/app/api/products/import/preview/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import * as XLSX from "xlsx";
import {
  ImportRow,
  ImageItem,
  headerLabels,
  HeaderKey,
  pickHeader,
  norm,
  asInt,
  asBool,
  asStatus,
  asDateIsoOrNull,
  // parseTags,
  parseImages,
  toVietnameseRows,
} from "@/features/products/import/shared";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file)
    return NextResponse.json({ message: "Thiếu file" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
  });

  if (!raw.length) {
    const columns = Object.keys(headerLabels) as HeaderKey[];
    const columnsVN = columns.map((k) => headerLabels[k]);
    return NextResponse.json({
      rows: [] as ImportRow[],
      rowsVN: [] as Record<string, unknown>[],
      labels: headerLabels,
      columns,
      columnsVN,
    });
  }

  // header mapping
  const headers = Object.keys(raw[0] ?? {});
  const map: Record<string, HeaderKey> = {};
  headers.forEach((h) => {
    const key = pickHeader(h);
    if (key) map[h] = key;
  });

  const rows: ImportRow[] = raw.map((r) => {
    const obj: ImportRow = {
      name: "",
      slug: "",
      price: 0,
      sku: null,
      stock: 0,
      imageUrl: null,
      description: null,
      brandName: null,
      categoryName: null,

      compareAtPrice: null,
      shortDescription: null,
      ingredients: null,
      usage: null,
      volume: null,
      volumeUnit: null,
      origin: null,
      // tags: [],
      isFeatured: false,
      status: "PUBLISHED",
      publishedAt: null,
      metaTitle: null,
      metaDescription: null,

      images: [],
      __errors: [],
    };

    for (const [h, key] of Object.entries(map)) {
      const val = r[h];
      switch (key) {
        case "price":
          obj.price = asInt(val);
          break;
        case "stock":
          obj.stock = asInt(val);
          break;
        case "name":
          obj.name = norm(val);
          break;
        case "slug":
          obj.slug = norm(val);
          break;
        case "sku": {
          const v = norm(val);
          obj.sku = v ? v : null;
          break;
        }
        case "imageUrl": {
          const v = norm(val);
          obj.imageUrl = v ? v : null;
          break;
        }
        case "description": {
          const v = norm(val);
          obj.description = v ? v : null;
          if (!obj.shortDescription && obj.description)
            obj.shortDescription = obj.description;
          break;
        }
        case "brandName": {
          const v = norm(val);
          obj.brandName = v ? v : null;
          break;
        }
        case "categoryName": {
          const v = norm(val);
          obj.categoryName = v ? v : null;
          break;
        }
        case "compareAtPrice":
          obj.compareAtPrice = norm(val) ? asInt(val) : null;
          // Nếu muốn fallback price từ compareAtPrice, bật 2 dòng dưới:
          if (!obj.price && obj.compareAtPrice) obj.price = obj.compareAtPrice;
          break;
        case "shortDescription": {
          const v = norm(val);
          obj.shortDescription = v ? v : null;
          break;
        }
        case "ingredients": {
          const v = norm(val);
          obj.ingredients = v ? v : null;
          break;
        }
        case "usage": {
          const v = norm(val);
          obj.usage = v ? v : null;
          break;
        }
        case "volume": {
          const v = norm(val);
          obj.volume = v ? v : null;
          break;
        }
        case "volume": {
          const v = norm(val);
          obj.volumeUnit = v ? v : null;
          break;
        }
        case "origin": {
          const v = norm(val);
          obj.origin = v ? v : null;
          break;
        }
        // case "tags":
        //   obj.tags = parseTags(val);
        //   break;
        case "isFeatured":
          obj.isFeatured = asBool(val);
          break;
        case "status":
          obj.status = asStatus(val);
          break;
        case "publishedAt":
          obj.publishedAt = asDateIsoOrNull(val);
          break;
        case "metaTitle": {
          const v = norm(val);
          obj.metaTitle = v ? v : null;
          break;
        }
        case "metaDescription": {
          const v = norm(val);
          obj.metaDescription = v ? v : null;
          break;
        }
        case "images":
          obj.images = parseImages(val);
          break;
      }
    }

    if (!obj.slug && obj.name) obj.slug = slugify(obj.name);

    // validate sơ bộ
    if (!obj.name) obj.__errors?.push("Thiếu name");
    if (!obj.slug) obj.__errors?.push("Thiếu slug");
    if (!Number.isFinite(obj.price) || obj.price < 0)
      obj.__errors?.push("Giá không hợp lệ");

    if (obj.__errors && obj.__errors.length === 0) delete obj.__errors;
    return obj;
  });

  // Gắn cờ tạo mới brand/category
  const brandNames = Array.from(
    new Set(rows.map((r) => (r.brandName ?? "").trim()).filter(Boolean))
  );
  const catNames = Array.from(
    new Set(rows.map((r) => (r.categoryName ?? "").trim()).filter(Boolean))
  );

  for (const bName of brandNames) {
    const existed = await prisma.brand.findFirst({
      where: { name: { equals: bName, mode: "insensitive" } },
      select: { id: true },
    });
    if (!existed) {
      rows.forEach((r) => {
        if ((r.brandName ?? "").trim().toLowerCase() === bName.toLowerCase())
          r.__newBrand = true;
      });
    }
  }

  for (const cName of catNames) {
    const existed = await prisma.category.findFirst({
      where: { name: { equals: cName, mode: "insensitive" } },
      select: { id: true },
    });
    if (!existed) {
      rows.forEach((r) => {
        if ((r.categoryName ?? "").trim().toLowerCase() === cName.toLowerCase())
          r.__newCategory = true;
      });
    }
  }

  // Chuẩn bị dữ liệu UI tiếng Việt
  const rowsVN = toVietnameseRows(rows);
  const columns = Object.keys(headerLabels) as HeaderKey[];
  const columnsVN = columns.map((k) => headerLabels[k]);

  return NextResponse.json({
    rows,
    rowsVN,
    labels: headerLabels,
    columns,
    columnsVN,
  });
}
