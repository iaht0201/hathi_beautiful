import Image from "next/image";
import { prisma } from "@/lib/prisma";
import CreateHeroForm from "./parts/CreateHeroForm";
import DragScrollX from "@/components/ui/drag-scroll-x";
import Link from "next/link";

function fmtDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN");
}

export default async function HeroSlidesPage() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      href: true,
      alt: true,
      position: true,
      active: true,
      startAt: true,
      endAt: true,
      createdAt: true,
      updatedAt: true,
      image: { select: { mobileUrl: true, desktopUrl: true } },
      caption: {
        select: { title: true, subtitle: true, ctaHref: true, ctaLabel: true },
      },
    },
  });

  return (
    <div className="grid grid-cols-1 gap-6 w-full">
      <div className="col-span-1 items-center justify-around">
        <header className="flex items-center  mb-4">
          <div className="flex flex-row justify-between w-full">
            <h1 className="text-xl font-semibold">Hero Slide</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/hero-slides/new"
                className="px-4 py-2 rounded-lg bg-black text-white"
              >
                + Thêm
              </Link>
            </div>
          </div>
        </header>

        <div className="border rounded ">
          <DragScrollX className=" overflow-x-auto ">
            <table className="w-full text-sm table-auto min-w-[2500px]">
              <thead className="bg-gray-50">
                <tr className="text-center">
                  <th className="p-2 w-12">#</th>
                  <th className="p-2 sticky left-0 bg-gray-50">
                    Caption Title
                  </th>
                  <th className="p-2">Caption Subtitle</th>
                  <th className="p-2 w-20">Vị trí</th>
                  <th className="p-2 w-20">Active</th>
                  <th className="p-2">Ngày bắt đầu</th>
                  <th className="p-2">Ngày kết thúc</th>
                  <th className="p-2 w-40">Mobile</th>
                  <th className="p-2 w-52">Desktop</th>

                  <th className="p-2">CTA Label</th>
                  <th className="p-2">CTA Href</th>

                  <th className="p-2">Alt</th>
                  <th className="p-2">Link</th>
                  <th className="p-2">Ngày tạo</th>
                  <th className="p-2">Đã cập nhập</th>
                  <th
                    className={`p-2 align-top ${"sticky right-0 bg-white z-10"}`}
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="text-center">
                {slides.map((c, idx) => (
                  <tr key={c.id} className="border-t align-top">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2 sticky left-0 bg-white z-10">
                      {c.caption?.title ?? "—"}
                    </td>
                    <td className="p-2">{c.caption?.subtitle ?? "—"}</td>
                    <td className="p-2">{c.position ?? "—"}</td>
                    <td className="p-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
                          c.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.active ? "Đang bật" : "Tắt"}
                      </span>
                    </td>
                    <td className="p-2">{fmtDate(c.startAt)}</td>
                    <td className="p-2">{fmtDate(c.endAt)}</td>

                    {/* Mobile thumbnail */}
                    <td className="p-2">
                      {c.image?.mobileUrl ? (
                        <a
                          href={c.image.mobileUrl}
                          target="_blank"
                          className="group inline-block"
                        >
                          <div className="relative w-28 aspect-[4/4] overflow-hidden rounded border bg-gray-50">
                            <Image
                              src={c.image.mobileUrl}
                              alt={`${c.alt || "mobile"} thumbnail`}
                              fill
                              sizes="112px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Desktop thumbnail */}
                    <td className="p-2">
                      {c.image?.desktopUrl ? (
                        <a
                          href={c.image.desktopUrl}
                          target="_blank"
                          className="group inline-block"
                        >
                          <div className="relative w-28 aspect-[4/4] overflow-hidden rounded border bg-gray-50">
                            <Image
                              src={c.image.desktopUrl}
                              alt={`${c.alt || "desktop"} thumbnail`}
                              fill
                              sizes="112px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-2">{c.caption?.ctaLabel ?? "—"}</td>
                    <td className="p-2">
                      {c.caption?.ctaHref ? (
                        <a
                          href={c.caption.ctaHref}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          {c.caption.ctaHref}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-2">{c.alt}</td>
                    <td className="p-2">
                      {c.href ? (
                        <a
                          href={c.href}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          {c.href}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2">{fmtDate(c.createdAt)}</td>
                    <td className="p-2">{fmtDate(c.updatedAt)}</td>
                    <td
                      className={`p-2 align-top ${"sticky right-0 bg-white z-10"}`}
                    >
                      <Link
                        href={`/admin/hero-slides/${c.id}/edit`}
                        className="text-blue-600"
                      >
                        Chỉnh sửa
                      </Link>

                      <span className="mx-2">·</span>

                      {/* <DeleteProductButton id={p.id} /> */}
                    </td>
                  </tr>
                ))}

                {slides.length === 0 && (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={15}>
                      Chưa có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DragScrollX>
        </div>
      </div>

      {/* Right: fixed (sticky) form */}
      {/* <div className="col-span-1">
        <div className="sticky top-6 border p-4 rounded bg-white shadow-sm">
          <CreateHeroForm />
        </div>
      </div> */}
    </div>
  );
}
