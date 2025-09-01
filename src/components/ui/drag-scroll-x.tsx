"use client";

import React, { useRef, useState, PropsWithChildren } from "react";

type WheelMode = "off" | "shift" | "auto";
type Props = PropsWithChildren<{ className?: string; wheelMode?: WheelMode }>;

export default function DragScrollX({
  className,
  wheelMode = "shift",
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startLeft = useRef(0);
  const dragging = useRef(false);
  const [grabbing, setGrabbing] = useState(false);

  function isInteractive(el: EventTarget | null): boolean {
    if (!(el instanceof HTMLElement)) return false;
    return !!el.closest("input, textarea, select, button, a, [data-no-drag]");
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (isInteractive(e.target)) return;
    const el = ref.current;
    if (!el) return;
    dragging.current = true;
    setGrabbing(true);
    startX.current = e.clientX;
    startLeft.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    e.preventDefault(); // tránh select chữ
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !dragging.current) return;
    const dx = e.clientX - startX.current;
    el.scrollLeft = startLeft.current - dx;
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    setGrabbing(false);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {}
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    // chỉ can thiệp khi có overflow ngang
    const canScrollX = el.scrollWidth > el.clientWidth;
    if (!canScrollX) return;

    if (wheelMode === "off") return;

    if (wheelMode === "shift") {
      // Giữ SHIFT để cuộn ngang
      if (!e.shiftKey) return; // để yên vertical scroll mặc định
      el.scrollLeft += e.deltaX || e.deltaY;
      e.preventDefault();
      return;
    }

    if (wheelMode === "auto") {
      // Trackpad nghiêng sang ngang (deltaX trội)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        el.scrollLeft += e.deltaX;
        e.preventDefault();
      }
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
      style={{
        cursor: grabbing ? "grabbing" : "grab",
        touchAction: "pan-y", // giữ scroll dọc cho trang/mobile
      }}
    >
      {children}
    </div>
  );
}
