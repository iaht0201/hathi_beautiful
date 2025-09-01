// utils/seo.ts (hoặc nơi bạn đang để file SEO)
export type SeoInput = {
  name: string;
  brandName?: string | null;
  categoryName?: string | null;
  volume?: string | null;
  shortDescription?: string | null;
  description?: string | null;
};

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function softTruncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  // cắt ở khoảng trắng gần nhất trước max, ưu tiên kết thúc câu
  const punctuationIdx = s.lastIndexOf(". ", max);
  if (punctuationIdx >= 40) return s.slice(0, punctuationIdx + 1).trim();
  const idx = s.lastIndexOf(" ", max);
  return s.slice(0, idx > 0 ? idx : max).trim() + "…";
}

function cleanTitle(s: string): string {
  return s
    .replace(/\s*\|\s*/g, " | ")
    .replace(/(\s*\|\s*){2,}/g, " | ")
    .replace(/^\s*\|\s*|\s*\|\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tạo metaTitle (~60 ký tự) + metaDescription (~160 ký tự) theo best-practice */
export function makeProductSeo(input: SeoInput): {
  metaTitle: string;
  metaDescription: string;
} {
  const name = (input.name || "").trim();
  const brand = (input.brandName || "").trim();
  const cat = (input.categoryName || "").trim();
  const vol = (input.volume || "").trim();

  // Title: "Name (Volume) | Brand" hoặc "Name | Brand" hoặc "Name | Category"
  const titleParts: string[] = [];
  if (name) titleParts.push(vol ? `${name} (${vol})` : name);
  if (brand) titleParts.push(brand);
  else if (cat) titleParts.push(cat);

  const rawTitle = cleanTitle(titleParts.join(" | ")) || "Sản phẩm";
  const metaTitle = softTruncateWords(rawTitle, 60);

  // Description: ưu tiên shortDescription, fallback description → strip html → cắt 160
  const baseDesc =
    (input.shortDescription && input.shortDescription.trim()) ||
    (input.description && input.description.trim()) ||
    "";

  let desc = stripHtml(baseDesc);

  // nếu còn ngắn, thêm brand/volume cho giàu ngữ cảnh
  const tailBits: string[] = [];
  if (brand) tailBits.push(`Thương hiệu: ${brand}`);
  if (vol) tailBits.push(`Dung tích: ${vol}`);
  if (cat) tailBits.push(`Danh mục: ${cat}`);
  if (tailBits.length && desc.length < 120) {
    desc = `${desc}${desc ? " " : ""}${tailBits.join(" • ")}`;
  }

  const metaDescription = softTruncateWords(desc, 160);
  return { metaTitle, metaDescription };
}
