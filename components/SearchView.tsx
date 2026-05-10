"use client";

import { useMemo, useState } from "react";
import { MemoCard } from "@/components/MemoCard";
import type { Memo, MemoCategory } from "@/types";

type SearchCategory = "ALL" | MemoCategory;

interface SearchViewProps {
  memos: Memo[];
  onMove: (memoId: string, category: MemoCategory) => void;
  onUpdate: (
    memoId: string,
    updates: Partial<Pick<Memo, "rawText" | "title" | "summary" | "tags">>,
  ) => void;
  onDelete: (memoId: string) => void;
}

const categoryFilters: Array<{ id: SearchCategory; label: string }> = [
  { id: "ALL", label: "전체" },
  { id: "PROJECT", label: "Project" },
  { id: "AREA", label: "Area" },
  { id: "RESOURCE", label: "Resource" },
  { id: "ARCHIVE", label: "Archive" },
];

export function SearchView({
  memos,
  onMove,
  onUpdate,
  onDelete,
}: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("ALL");
  const cleanQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    return memos
      .filter((memo) => category === "ALL" || memo.category === category)
      .filter((memo) => {
        if (!cleanQuery) {
          return true;
        }

        const searchableText = [
          memo.title,
          memo.rawText,
          memo.summary,
          ...(memo.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(cleanQuery);
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [category, cleanQuery, memos]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[#dfe7da] bg-white/86 p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900/86">
        <label htmlFor="memo-search" className="sr-only">
          메모 검색
        </label>
        <input
          id="memo-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목, 내용, 태그를 검색하세요"
          className="w-full rounded-2xl border border-[#dfe7da] bg-[#fbfcf8] px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8fab91] focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50 dark:placeholder:text-stone-500 dark:focus:border-emerald-700 dark:focus:ring-emerald-950"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {categoryFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setCategory(filter.id)}
              className={
                category === filter.id
                  ? "rounded-full bg-[#e8f1e4] px-3 py-2 text-sm font-semibold text-[#294432] ring-1 ring-[#9fb99d]/50 dark:bg-emerald-950 dark:text-emerald-100"
                  : "rounded-full border border-[#dfe7da] bg-white px-3 py-2 text-sm font-semibold text-stone-500 transition hover:bg-[#f7faf4] hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <section className="rounded-2xl border border-[#dfe7da] bg-white/86 px-6 py-12 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900/86">
          <p className="text-base font-semibold text-stone-900 dark:text-stone-50">
            검색 결과가 없어요.
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            다른 키워드로 다시 찾아보세요.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              compact
              onMove={onMove}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
