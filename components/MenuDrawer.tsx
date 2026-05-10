"use client";

import { useEffect } from "react";

export type DrawerViewId =
  | "capture"
  | "all-memos"
  | "search"
  | "para"
  | "execution"
  | "review"
  | "archive"
  | "help";

interface MenuDrawerProps {
  activeView: DrawerViewId;
  isOpen: boolean;
  onClose: () => void;
  onOpenView: (viewId: DrawerViewId) => void;
}

const workflowSections: Array<{
  label: string;
  items: Array<{ id: DrawerViewId; label: string }>;
}> = [
  {
    label: "기록",
    items: [
      { id: "all-memos", label: "전체 메모" },
      { id: "search", label: "검색" },
    ],
  },
  {
    label: "정리",
    items: [
      { id: "para", label: "PARA 보드" },
      { id: "execution", label: "실행 보드" },
      { id: "review", label: "주간 리뷰" },
    ],
  },
  {
    label: "보관",
    items: [{ id: "archive", label: "Archive" }],
  },
  {
    label: "지원",
    items: [{ id: "help", label: "도움말 / 피드백" }],
  },
];

export function MenuDrawer({
  activeView,
  isOpen,
  onClose,
  onOpenView,
}: MenuDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={
        isOpen
          ? "fixed inset-0 z-40 pointer-events-auto"
          : "pointer-events-none fixed inset-0 z-40"
      }
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className={
          isOpen
            ? "absolute inset-0 bg-stone-950/18 opacity-100 transition-opacity dark:bg-black/45"
            : "absolute inset-0 bg-stone-950/18 opacity-0 transition-opacity dark:bg-black/45"
        }
      />
      <aside
        className={
          isOpen
            ? "absolute left-0 top-0 h-full w-[min(88vw,320px)] translate-x-0 overflow-y-auto border-r border-[#dde7d7] bg-[#fffdf7] p-5 shadow-2xl transition-transform duration-300 ease-out dark:border-stone-800 dark:bg-[#141b17]"
            : "absolute left-0 top-0 h-full w-[min(88vw,320px)] -translate-x-full overflow-y-auto border-r border-[#dde7d7] bg-[#fffdf7] p-5 shadow-2xl transition-transform duration-300 ease-out dark:border-stone-800 dark:bg-[#141b17]"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpenView("capture")}
            className="font-display-serif text-2xl font-semibold text-[#1f2b22] transition hover:text-[#58765f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-100 dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-900"
          >
            Dunning Note
          </button>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-100 dark:focus-visible:ring-emerald-900"
          >
            ×
          </button>
        </div>

        <nav
          className="mt-8 space-y-7 pb-[env(safe-area-inset-bottom)]"
          aria-label="앱 워크플로 메뉴"
        >
          <button
            type="button"
            onClick={() => onOpenView("capture")}
            className={getItemClass(activeView === "capture")}
          >
            홈
          </button>

          {workflowSections.map((section) => (
            <section key={section.label}>
              <p className="px-3 text-xs font-semibold uppercase text-stone-400 dark:text-stone-500">
                {section.label}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenView(item.id)}
                    className={getItemClass(activeView === item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </nav>
      </aside>
    </div>
  );
}

function getItemClass(isActive: boolean) {
  return isActive
    ? "flex min-h-12 w-full items-center rounded-2xl bg-[#eef5ea] px-4 py-3 text-left text-[15px] font-bold text-[#294432] ring-1 ring-[#b6cbb3]/50 dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-900"
    : "flex min-h-12 w-full items-center rounded-2xl px-4 py-3 text-left text-[15px] font-semibold text-stone-600 transition hover:bg-stone-50 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50 dark:focus-visible:ring-emerald-900";
}
