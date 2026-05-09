"use client";

import { useEffect, useRef, useState } from "react";

interface HeroCaptureProps {
  onCreateMemo: (rawText: string) => void;
}

export function HeroCapture({ onCreateMemo }: HeroCaptureProps) {
  const [rawText, setRawText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <form onSubmit={handleSubmit} className="w-full max-w-4xl px-2 sm:px-0">
      <div className="group flex min-h-16 items-center gap-3 rounded-[2rem] border border-[rgba(91,120,92,0.18)] bg-white/88 px-5 py-2 shadow-[0_24px_70px_rgba(45,68,46,0.12)] backdrop-blur-md transition focus-within:border-emerald-300 focus-within:shadow-[0_28px_90px_rgba(71,105,75,0.16)] dark:border-stone-700 dark:bg-stone-900/86 dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)] dark:focus-within:border-emerald-700 sm:min-h-[72px] sm:px-6">
        <textarea
          ref={textareaRef}
          aria-label="메모 입력"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="메모를 바로 던져보세요"
          className="max-h-40 min-h-8 flex-1 resize-none overflow-y-auto bg-transparent py-3 text-base leading-6 text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500 sm:text-lg"
        />
        <button
          type="submit"
          aria-label="메모 저장"
          disabled={!rawText.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6f8f73] text-2xl leading-none text-white shadow-sm transition hover:scale-105 hover:bg-[#58765f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:focus-visible:ring-emerald-900 sm:h-12 sm:w-12"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
