"use client";

import { useState } from "react";
import { createSummary, createTitle } from "@/lib/storage";
import type { MemoAttachment } from "@/types";

interface QuickCaptureProps {
  onCreateMemo: (rawText: string, attachments?: MemoAttachment[]) => void;
  variant?: "card" | "hero";
}

export function QuickCapture({
  onCreateMemo,
  variant = "card",
}: QuickCaptureProps) {
  const [rawText, setRawText] = useState("");
  const previewTitle = createTitle(rawText);
  const previewSummary = createSummary(rawText);
  const hasPreview = Boolean(rawText.trim());
  const isHero = variant === "hero";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rawText.trim()) {
      return;
    }

    onCreateMemo(rawText);
    setRawText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isHero
          ? "w-full"
          : "rounded-lg border border-emerald-100 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
      }
    >
      <label
        htmlFor="quick-capture"
        className={
          isHero
            ? "sr-only"
            : "text-sm font-semibold text-stone-700 dark:text-stone-200"
        }
      >
        빠른 메모
      </label>
      <textarea
        id="quick-capture"
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        rows={isHero ? 4 : 5}
        placeholder={
          isHero
            ? "메모를 바로 던져보세요"
            : "아무렇게나 적어두세요. 분류는 나중에 직접 하면 됩니다."
        }
        className={
          isHero
            ? "w-full resize-none rounded-2xl border border-emerald-100 bg-white px-5 py-5 text-base text-stone-900 shadow-md outline-none transition placeholder:text-stone-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
            : "mt-3 w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-emerald-500 dark:focus:bg-stone-950 dark:focus:ring-emerald-950"
        }
      />
      {hasPreview ? (
        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              AI 자동 분리
            </span>
            <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-stone-500 dark:bg-stone-900 dark:text-stone-400">
              Preview
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-md bg-white p-3 dark:bg-stone-900">
              <p className="text-xs font-bold text-stone-400 dark:text-stone-500">
                제목
              </p>
              <p className="mt-1 break-words text-sm font-bold text-stone-900 dark:text-stone-100">
                {previewTitle}
              </p>
            </div>
            <div className="rounded-md bg-white p-3 dark:bg-stone-900">
              <p className="text-xs font-bold text-stone-400 dark:text-stone-500">
                내용
              </p>
              <p className="mt-1 break-words text-sm leading-6 text-stone-700 dark:text-stone-300">
                {previewSummary}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          disabled={!rawText.trim()}
        >
          {isHero ? "메모 던지기" : "Inbox에 저장"}
        </button>
      </div>
    </form>
  );
}
