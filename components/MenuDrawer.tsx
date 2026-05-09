"use client";

import { ThemeSettings } from "@/components/ThemeSettings";
import type { ThemeMode } from "@/types";

export type DrawerViewId =
  | "capture"
  | "dashboard"
  | "inbox"
  | "para"
  | "projects"
  | "review";

interface MenuDrawerProps {
  activeView: DrawerViewId;
  isOpen: boolean;
  theme: ThemeMode;
  onClose: () => void;
  onOpenView: (viewId: DrawerViewId) => void;
  onThemeChange: (theme: ThemeMode) => void;
}

const primaryItems: Array<{ id: DrawerViewId; label: string }> = [
  { id: "dashboard", label: "대시보드" },
  { id: "inbox", label: "Inbox" },
  { id: "para", label: "PARA 보드" },
  { id: "projects", label: "Projects" },
  { id: "review", label: "주간 리뷰" },
];

export function MenuDrawer({
  activeView,
  isOpen,
  theme,
  onClose,
  onOpenView,
  onThemeChange,
}: MenuDrawerProps) {
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
            ? "absolute inset-0 bg-stone-950/18 opacity-100 transition-opacity dark:bg-black/40"
            : "absolute inset-0 bg-stone-950/18 opacity-0 transition-opacity dark:bg-black/40"
        }
      />
      <aside
        className={
          isOpen
            ? "absolute left-0 top-0 h-full w-[min(86vw,360px)] translate-x-0 border-r border-[#dde7d7] bg-[#fffdf7] p-6 shadow-2xl transition-transform duration-300 ease-out dark:border-stone-800 dark:bg-[#141b17]"
            : "absolute left-0 top-0 h-full w-[min(86vw,360px)] -translate-x-full border-r border-[#dde7d7] bg-[#fffdf7] p-6 shadow-2xl transition-transform duration-300 ease-out dark:border-stone-800 dark:bg-[#141b17]"
        }
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onOpenView("capture")}
            className="font-display-serif text-2xl font-semibold text-[#1f2b22] transition hover:text-[#58765f] dark:text-stone-100 dark:hover:text-emerald-300"
          >
            Dunning Note
          </button>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-2xl leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          >
            ×
          </button>
        </div>

        <nav className="mt-10 space-y-1" aria-label="주요 메뉴">
          {primaryItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenView(item.id)}
              className={
                activeView === item.id
                  ? "block w-full rounded-xl bg-[#eef5ea] px-4 py-3 text-left text-sm font-semibold text-[#294432] dark:bg-emerald-950 dark:text-emerald-100"
                  : "block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-stone-600 transition hover:bg-stone-50 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50"
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-10 border-t border-[#e1e8dc] pt-6 dark:border-stone-800">
          <ThemeSettings theme={theme} onThemeChange={onThemeChange} />
        </div>
      </aside>
    </div>
  );
}
