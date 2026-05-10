import { formatDateTime } from "@/lib/date";
import type { Memo } from "@/types";

interface ArchiveViewProps {
  memos: Memo[];
  onRestore: (memoId: string) => void;
  onDelete: (memoId: string) => void;
}

export function ArchiveView({ memos, onRestore, onDelete }: ArchiveViewProps) {
  const archivedMemos = memos
    .filter((memo) => memo.category === "ARCHIVE")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  if (archivedMemos.length === 0) {
    return (
      <section className="rounded-2xl border border-[#dfe7da] bg-white/86 px-6 py-12 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900/86">
        <p className="text-base font-semibold text-stone-900 dark:text-stone-50">
          보관된 메모가 없어요.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {archivedMemos.map((memo) => (
        <article
          key={memo.id}
          className="rounded-2xl border border-[#dfe7da] bg-white p-5 shadow-sm transition hover:shadow-md dark:border-stone-700 dark:bg-stone-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
                보관됨 · {formatDateTime(memo.updatedAt)}
              </p>
              <h2 className="mt-2 break-words text-base font-bold text-stone-900 dark:text-stone-50">
                {memo.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onRestore(memo.id)}
              className="shrink-0 rounded-full bg-[#e8f1e4] px-3 py-2 text-xs font-bold text-[#294432] transition hover:bg-[#dcebd6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900 dark:focus-visible:ring-emerald-900"
            >
              Inbox로 복원
            </button>
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-stone-600 dark:text-stone-300">
            {memo.rawText}
          </p>

          {memo.attachments && memo.attachments.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {memo.attachments.map((attachment) => (
                <span
                  key={attachment.id}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400"
                >
                  {attachment.name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onDelete(memo.id)}
              className="rounded-full px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 dark:text-rose-300 dark:hover:bg-rose-950 dark:focus-visible:ring-rose-950"
            >
              삭제
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
