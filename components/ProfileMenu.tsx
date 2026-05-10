"use client";

import { useEffect, useRef } from "react";

interface ProfileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
  onLoginClick: () => void;
  onHelpClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onVersionClick: () => void;
}

export function ProfileMenu({
  isOpen,
  onToggle,
  onClose,
  onOpenSettings,
  onExportData,
  onImportData,
  onResetData,
  onLoginClick,
  onHelpClick,
  onPrivacyClick,
  onTermsClick,
  onVersionClick,
}: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Node && menuRef.current?.contains(target)) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const runAndClose = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="프로필 메뉴 열기"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-[#dbe8d2] to-[#8ca887] text-sm font-semibold text-[#203026] shadow-[0_10px_26px_rgba(45,68,46,0.12)] ring-1 ring-[#7f9b7f]/25 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:border-stone-800 dark:from-[#263229] dark:to-[#415447] dark:text-emerald-50 dark:ring-emerald-900/50 dark:focus-visible:ring-emerald-900"
      >
        G
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[#dfe7da] bg-white/95 p-3 text-left shadow-[0_24px_80px_rgba(35,48,38,0.18)] backdrop-blur-xl dark:border-stone-800 dark:bg-[#1a211d]/95 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
        >
          <div className="rounded-2xl bg-[#f6f8f2] p-4 dark:bg-[#121815]">
            <p className="text-sm font-semibold text-stone-950 dark:text-stone-50">
              게스트 모드
            </p>
            <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
              로그인하면 여러 기기에서 메모를 동기화할 수 있어요.
            </p>
            <button
              type="button"
              role="menuitem"
              onClick={() => runAndClose(onLoginClick)}
              className="mt-3 w-full rounded-full bg-[#27382b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2d22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:bg-emerald-100 dark:text-[#142018] dark:hover:bg-white dark:focus-visible:ring-emerald-900"
            >
              로그인 / 회원가입
            </button>
          </div>

          <div className="mt-3 space-y-1">
            <ProfileMenuItem label="설정" onClick={() => runAndClose(onOpenSettings)} />
            <ProfileMenuItem
              label="데이터 내보내기"
              onClick={() => runAndClose(onExportData)}
            />
            <ProfileMenuItem
              label="데이터 가져오기"
              onClick={() => runAndClose(onImportData)}
            />
            <ProfileMenuItem
              label="데이터 초기화"
              danger
              onClick={() => runAndClose(onResetData)}
            />
            <ProfileMenuItem
              label="도움말 / 피드백"
              onClick={() => runAndClose(onHelpClick)}
            />
          </div>

          <div className="mt-3 border-t border-[#edf1e9] pt-2 dark:border-stone-800">
            <ProfileMenuItem
              label="개인정보 처리방침"
              variant="footer"
              onClick={() => runAndClose(onPrivacyClick)}
            />
            <ProfileMenuItem
              label="서비스 이용약관"
              variant="footer"
              onClick={() => runAndClose(onTermsClick)}
            />
            <ProfileMenuItem
              label="버전 정보"
              variant="footer"
              onClick={() => runAndClose(onVersionClick)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfileMenuItem({
  label,
  onClick,
  variant = "default",
  danger = false,
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "footer";
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        danger
          ? "block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 dark:text-rose-300 dark:hover:bg-rose-950 dark:focus-visible:ring-rose-950"
          : variant === "footer"
          ? "block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-stone-500 transition hover:bg-stone-50 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 dark:focus-visible:ring-emerald-900"
          : "block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-stone-700 transition hover:bg-[#f4f7f0] hover:text-stone-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white dark:focus-visible:ring-emerald-900"
      }
    >
      {label}
    </button>
  );
}
