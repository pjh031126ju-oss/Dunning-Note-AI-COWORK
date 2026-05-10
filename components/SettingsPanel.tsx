"use client";

import { useEffect, useRef } from "react";
import type { ThemeMode } from "@/types";

interface SettingsPanelProps {
  isOpen: boolean;
  theme: ThemeMode;
  onClose: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
}

const themeOptions: Array<{ id: ThemeMode; label: string }> = [
  { id: "light", label: "라이트 모드" },
  { id: "dark", label: "다크 모드" },
  { id: "system", label: "시스템 설정 따라가기" },
];

export function SettingsPanel({
  isOpen,
  theme,
  onClose,
  onThemeChange,
  onExportData,
  onImportData,
  onResetData,
}: SettingsPanelProps) {
  const panelRef = useRef<HTMLElement>(null);

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
          ? "fixed inset-0 z-50 pointer-events-auto"
          : "pointer-events-none fixed inset-0 z-50"
      }
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="설정 닫기"
        onClick={onClose}
        className={
          isOpen
            ? "absolute inset-0 bg-stone-950/24 opacity-100 transition-opacity dark:bg-black/50"
            : "absolute inset-0 bg-stone-950/24 opacity-0 transition-opacity dark:bg-black/50"
        }
      />
      <aside
        ref={panelRef}
        aria-label="설정"
        className={
          isOpen
            ? "absolute right-0 top-0 h-full w-[min(92vw,420px)] translate-x-0 overflow-y-auto border-l border-[#dfe7da] bg-[#fffdf7] p-6 shadow-2xl transition-transform duration-300 ease-out dark:border-stone-800 dark:bg-[#141b17]"
            : "absolute right-0 top-0 h-full w-[min(92vw,420px)] translate-x-full overflow-y-auto border-l border-[#dfe7da] bg-[#fffdf7] p-6 shadow-2xl transition-transform duration-300 ease-out dark:border-stone-800 dark:bg-[#141b17]"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#6f8f73] dark:text-emerald-300">
              Settings
            </p>
            <h2 className="mt-1 text-2xl font-bold text-stone-950 dark:text-stone-50">
              설정
            </h2>
          </div>
          <button
            type="button"
            aria-label="설정 닫기"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-100 dark:focus-visible:ring-emerald-900"
          >
            ×
          </button>
        </div>

        <div className="mt-8 space-y-5 pb-[env(safe-area-inset-bottom)]">
          <SettingsSection title="화면 설정">
            <div className="grid gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onThemeChange(option.id)}
                  className={
                    theme === option.id
                      ? "min-h-12 rounded-2xl bg-[#e8f1e4] px-4 py-3 text-left text-sm font-semibold text-[#294432] ring-1 ring-[#9fb99d]/50 dark:bg-emerald-950 dark:text-emerald-100"
                      : "min-h-12 rounded-2xl border border-[#dfe7da] bg-white/70 px-4 py-3 text-left text-sm font-semibold text-stone-500 transition hover:bg-white hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="메모 설정">
            <InfoRow label="기본 저장 위치" value="Inbox" />
            <InfoRow label="Enter로 저장" value="켜짐" />
            <InfoRow label="Shift+Enter" value="줄바꿈" />
          </SettingsSection>

          <SettingsSection title="리뷰 설정">
            <InfoRow label="오래된 메모 기준" value="7일" />
            <InfoRow label="멈춘 실행 항목 기준" value="5일" />
            <InfoRow label="Archive 후보 Resource 기준" value="30일" />
          </SettingsSection>

          <SettingsSection title="데이터">
            <div className="grid gap-2">
              <DataButton label="데이터 내보내기" onClick={onExportData} />
              <DataButton label="데이터 가져오기" onClick={onImportData} />
              <DataButton label="데이터 초기화" danger onClick={onResetData} />
            </div>
          </SettingsSection>
        </div>
      </aside>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e1e8dc] bg-white/70 p-4 dark:border-stone-800 dark:bg-stone-900/70">
      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-t border-[#edf1e9] py-2 first:border-t-0 dark:border-stone-800">
      <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
      <span className="shrink-0 text-sm font-semibold text-stone-800 dark:text-stone-100">
        {value}
      </span>
    </div>
  );
}

function DataButton({
  label,
  danger = false,
  onClick,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        danger
          ? "min-h-12 rounded-2xl border border-rose-100 bg-white/70 px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 dark:border-rose-950 dark:bg-stone-900/70 dark:text-rose-300 dark:hover:bg-rose-950 dark:focus-visible:ring-rose-950"
          : "min-h-12 rounded-2xl border border-[#dfe7da] bg-white/70 px-4 py-3 text-left text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50 dark:focus-visible:ring-emerald-900"
      }
    >
      {label}
    </button>
  );
}
