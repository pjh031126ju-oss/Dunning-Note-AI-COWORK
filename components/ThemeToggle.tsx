"use client";

import { useEffect, useState } from "react";
import { THEME_KEY } from "@/lib/storage";
import type { ThemeMode } from "@/types";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const nextTheme: ThemeMode = storedTheme === "dark" ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  return (
    <button
      type="button"
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
      className="rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 dark:border-emerald-900 dark:bg-stone-900 dark:text-emerald-200 dark:hover:bg-stone-800"
    >
      {theme === "dark" ? "라이트 모드" : "다크 모드"}
    </button>
  );
}
