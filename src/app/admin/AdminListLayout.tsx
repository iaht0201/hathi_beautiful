"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import DragScrollX from "@/components/ui/drag-scroll-x";

type SelectionState = {
  selected: Record<string, boolean>;
  selectedIds: string[];
  allChecked: boolean;
  indeterminate: boolean;
  toggle: (id: string) => void;
  selectAll: () => void;
  clearAll: () => void;
};

const SelectionCtx = createContext<SelectionState | null>(null);

function useSelection(): SelectionState {
  const ctx = useContext(SelectionCtx);
  if (!ctx) throw new Error("useSelection must be used within AdminListLayout");
  return ctx;
}

export function HeaderCheckbox() {
  const { allChecked, indeterminate, selectAll, clearAll } = useSelection();
  return (
    <input
      type="checkbox"
      aria-label="Chọn tất cả"
      className="h-4 w-4"
      checked={allChecked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={(e) => (e.target.checked ? selectAll() : clearAll())}
    />
  );
}

export function RowCheckbox({ id, label }: { id: string; label?: string }) {
  const { selected, toggle } = useSelection();
  return (
    <input
      type="checkbox"
      aria-label={label ?? `Chọn ${id}`}
      className="h-4 w-4"
      checked={!!selected[id]}
      onChange={() => toggle(id)}
    />
  );
}

type AdminListLayoutProps = {
  title: string;
  rowIds: string[];
  addHref?: string; // link nút + Thêm
  bulkDeleteHref?: string; // API xoá hàng loạt
  rightActions?: React.ReactNode; // chèn thêm nút/phím khác ở header
  childrenAction: (ctx: {
    HeaderCheckbox: typeof HeaderCheckbox;
    RowCheckbox: typeof RowCheckbox;
    selectedIds: string[];
  }) => React.ReactNode; // render-prop để render <table> tuỳ ý
};

/**
 * Layout chuẩn cho các trang admin listing:
 * - Quản lý state chọn dòng & bulk actions
 * - Header có: Chọn tất cả, Bỏ chọn, Xoá đã chọn, +Thêm
 * - Bọc nội dung trong DragScrollX
 */
export default function AdminListLayout({
  title,
  rowIds,
  addHref,
  bulkDeleteHref,
  rightActions,
  childrenAction,
}: AdminListLayoutProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const selectedIds = useMemo(
    () => rowIds.filter((id) => selected[id]),
    [rowIds, selected]
  );
  const allChecked =
    selectedIds.length > 0 && selectedIds.length === rowIds.length;
  const indeterminate = selectedIds.length > 0 && !allChecked;

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const selectAll = () => {
    const next: Record<string, boolean> = {};
    for (const id of rowIds) next[id] = true;
    setSelected(next);
  };
  const clearAll = () => setSelected({});

  const handleBulkDelete = () => {
    if (!bulkDeleteHref) return;
    if (selectedIds.length === 0) return;
    const ok = confirm(
      `Xoá ${selectedIds.length} mục đã chọn? Hành động không thể hoàn tác.`
    );
    if (!ok) return;

    startTransition(async () => {
      const res = await fetch(bulkDeleteHref, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const t = await res.text();
        alert(`Xoá thất bại: ${t}`);
        return;
      }
      window.location.reload();
    });
  };

  const ctxValue: SelectionState = {
    selected,
    selectedIds,
    allChecked,
    indeterminate,
    toggle,
    selectAll,
    clearAll,
  };

  return (
    <SelectionCtx.Provider value={ctxValue}>
      <div className="grid grid-cols-1 gap-6 w-full">
        <div className="col-span-1">
          <header className="flex items-center mb-4">
            <div className="flex flex-row justify-between w-full">
              <h1 className="text-xl font-semibold">{title}</h1>
              <div className="flex items-center gap-2">
                {/* Bulk actions */}
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-3 py-2 rounded-lg border"
                  title="Chọn tất cả"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-2 rounded-lg border"
                  title="Bỏ chọn tất cả"
                >
                  Bỏ chọn
                </button>
                {bulkDeleteHref && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0 || isPending}
                    className={`px-3 py-2 rounded-lg ${
                      selectedIds.length === 0 || isPending
                        ? "bg-gray-200 text-gray-500"
                        : "bg-red-600 text-white"
                    }`}
                    title="Xoá các mục đã chọn"
                  >
                    {isPending
                      ? "Đang xoá..."
                      : `Xoá đã chọn (${selectedIds.length})`}
                  </button>
                )}

                {rightActions}

                {addHref && (
                  <Link
                    href={addHref}
                    className="px-4 py-2 rounded-lg bg-black text-white"
                  >
                    + Thêm
                  </Link>
                )}
              </div>
            </div>
          </header>

          <div className="border rounded">
            <DragScrollX className="overflow-x-auto">
              {childrenAction({ HeaderCheckbox, RowCheckbox, selectedIds })}
            </DragScrollX>
          </div>
        </div>
      </div>
    </SelectionCtx.Provider>
  );
}
