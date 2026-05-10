"use client";

import { useMemo, useState } from "react";
import { MemoCard } from "@/components/MemoCard";
import { getDaysOld } from "@/lib/date";
import type { Memo, MemoCategory, ProjectItem } from "@/types";

type MemoFilter = "all" | "unclassified" | "recent" | "attachments" | "done";

interface AllMemosViewProps {
  memos: Memo[];
  projects: ProjectItem[];
  onMove: (memoId: string, category: MemoCategory) => void;
  onUpdate: (
    memoId: string,
    updates: Partial<Pick<Memo, "rawText" | "title" | "summary" | "tags">>,
  ) => void;
  onDelete: (memoId: string) => void;
  onOpenHome: () => void;
}

const filters: Array<{ id: MemoFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "unclassified", label: "미분류" },
  { id: "recent", label: "최근 작성" },
  { id: "attachments", label: "첨부 있음" },
  { id: "done", label: "완료됨" },
];

export function AllMemosView({
  memos,
  projects,
  onMove,
  onUpdate,
  onDelete,
  onOpenHome,
}: AllMemosViewProps) {
  const [activeFilter, setActiveFilter] = useState<MemoFilter>("all");
  const doneMemoIds = useMemo(
    () =>
      new Set(
        projects
          .filter((project) => project.status === "done" || project.progress === 100)
          .map((project) => project.memoId),
      ),
    [projects],
  );

  const filteredMemos = useMemo(() => {
    const sortedMemos = [...memos].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (activeFilter === "unclassified") {
      return sortedMemos.filter((memo) => memo.category === "INBOX");
    }

    if (activeFilter === "recent") {
      return sortedMemos.filter((memo) => getDaysOld(memo.createdAt) <= 7);
    }

    if (activeFilter === "attachments") {
      return sortedMemos.filter((memo) => (memo.attachments?.length ?? 0) > 0);
    }

    if (activeFilter === "done") {
      return sortedMemos.filter(
        (memo) => memo.category === "ARCHIVE" || doneMemoIds.has(memo.id),
      );
    }

    return sortedMemos;
  }, [activeFilter, doneMemoIds, memos]);

  if (memos.length === 0) {
    return (
      <EmptyState
        title="아직 기록된 메모가 없어요."
        description="홈에서 첫 메모를 남겨보세요."
        actionLabel="홈으로 가기"
        onAction={onOpenHome}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={
              activeFilter === filter.id
                ? "rounded-full bg-[#e8f1e4] px-4 py-2 text-sm font-semibold text-[#294432] ring-1 ring-[#9fb99d]/50 dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-900"
                : "rounded-full border border-[#dfe7da] bg-white/80 px-4 py-2 text-sm font-semibold text-stone-500 transition hover:bg-white hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredMemos.length === 0 ? (
        <EmptyState
          title="조건에 맞는 메모가 없어요."
          description="다른 필터로 다시 확인해보세요."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredMemos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              compact
              showDecisionHelper={memo.category === "INBOX"}
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

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[#dfe7da] bg-white/86 px-6 py-12 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900/86">
      <p className="text-base font-semibold text-stone-900 dark:text-stone-50">
        {title}
      </p>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-[#5f7f64] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f6d55] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:bg-emerald-100 dark:text-[#142018] dark:hover:bg-white dark:focus-visible:ring-emerald-900"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
