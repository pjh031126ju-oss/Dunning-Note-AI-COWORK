"use client";

import type { ThemeMode } from "@/types";

interface ThemeSettingsProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export function ThemeSettings({ theme, onThemeChange }: ThemeSettingsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-stone-400 dark:text-stone-500">
        설정
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onThemeChange("light")}
          className={
            theme === "light"
              ? "rounded-full bg-[#eff5e9] px-3 py-2 text-sm font-semibold text-[#2f4a35] ring-1 ring-[#8fab91]/40 dark:bg-emerald-950 dark:text-emerald-100"
              : "rounded-full px-3 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800"
          }
        >
          라이트 모드
        </button>
        <button
          type="button"
          onClick={() => onThemeChange("dark")}
          className={
            theme === "dark"
              ? "rounded-full bg-[#233128] px-3 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-800"
              : "rounded-full px-3 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800"
          }
        >
          다크 모드
        </button>
      </div>
    </div>
  );
}
