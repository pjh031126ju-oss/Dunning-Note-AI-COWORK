"use client";

import { ArrowUp, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeroCaptureProps {
  onCreateMemo: (rawText: string) => void;
  variant?: "default" | "landing";
}

export function HeroCapture({
  onCreateMemo,
  variant = "default",
}: HeroCaptureProps) {
  const [rawText, setRawText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLanding = variant === "landing";

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [rawText]);

  const submitMemo = () => {
    if (!rawText.trim()) {
      return;
    }

    onCreateMemo(rawText);
    setRawText("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMemo();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    submitMemo();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={isLanding ? "w-full" : "w-full max-w-4xl px-2 sm:px-0"}
    >
      <div className={isLanding ? "group relative" : ""}>
        {isLanding ? (
          <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 blur transition duration-500 group-hover:opacity-100" />
        ) : null}
        <div
          className={
            isLanding
              ? "relative flex min-h-16 items-center gap-2 rounded-[32px] bg-white p-2 shadow-2xl ring-1 ring-stone-200 transition focus-within:ring-stone-300 dark:bg-[#1e1f20] dark:ring-transparent dark:focus-within:ring-gray-600 sm:min-h-[72px]"
              : "group flex min-h-16 items-center gap-3 rounded-[2rem] border border-[rgba(91,120,92,0.18)] bg-white/88 px-5 py-2 shadow-[0_24px_70px_rgba(45,68,46,0.12)] backdrop-blur-md transition focus-within:border-emerald-300 focus-within:shadow-[0_28px_90px_rgba(71,105,75,0.16)] dark:border-stone-700 dark:bg-stone-900/86 dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)] dark:focus-within:border-emerald-700 sm:min-h-[72px] sm:px-6"
          }
        >
        <textarea
          ref={textareaRef}
          aria-label="메모 입력"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={isLanding ? "메모를 입력하세요..." : "메모를 바로 던져보세요"}
          className={
            isLanding
              ? "max-h-40 min-h-8 flex-1 resize-none overflow-y-auto bg-transparent px-5 py-3 text-base leading-6 text-stone-900 outline-none placeholder:text-stone-400 dark:text-gray-200 dark:placeholder:text-gray-500 sm:px-6 sm:text-lg"
              : "max-h-40 min-h-8 flex-1 resize-none overflow-y-auto bg-transparent py-3 text-base leading-6 text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500 sm:text-lg"
          }
        />
        <div className={isLanding ? "flex items-center gap-2 pr-2" : "flex items-center"}>
          {isLanding ? (
          <button
            type="button"
            title="음성 입력"
            aria-label="음성 입력"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-gray-400 dark:hover:bg-[#282a2c] dark:hover:text-gray-200"
          >
            <Mic size={23} />
          </button>
          ) : null}
        <button
          type="submit"
          aria-label="메모 저장"
          disabled={!rawText.trim()}
          className={
            isLanding
              ? rawText.trim()
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white transition-all duration-300 hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-950/15 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus-visible:ring-white/15"
                : "flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-all duration-300 dark:bg-[#282a2c] dark:text-gray-500"
              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6f8f73] text-2xl leading-none text-white shadow-sm transition hover:scale-105 hover:bg-[#58765f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:focus-visible:ring-emerald-900 sm:h-12 sm:w-12"
          }
        >
          {isLanding ? (
            <ArrowUp size={20} strokeWidth={3} aria-hidden="true" />
          ) : (
            <span aria-hidden="true">→</span>
          )}
        </button>
        </div>
        </div>
      </div>
    </form>
  );
}
