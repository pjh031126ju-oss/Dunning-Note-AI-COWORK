import { formatDate, formatDateTime, getDaysOld } from "@/lib/date";
import type { Memo, MemoCategory, ProjectItem } from "@/types";

interface WeeklyReviewProps {
  memos: Memo[];
  projects: ProjectItem[];
  lastReviewAt?: string;
  onMoveMemo: (memoId: string, category: MemoCategory) => void;
  onCompleteReview: () => void;
}

export function WeeklyReview({
  memos,
  projects,
  lastReviewAt,
  onMoveMemo,
  onCompleteReview,
}: WeeklyReviewProps) {
  const oldInbox = memos.filter(
    (memo) => memo.category === "INBOX" && getDaysOld(memo.createdAt) >= 7,
  );
  const stalledProjects = projects.filter((project) => {
    const memo = memos.find((item) => item.id === project.memoId);
    return (
      memo?.category === "PROJECT" &&
      project.status !== "done" &&
      getDaysOld(project.updatedAt) >= 5
    );
  });
  const archiveCandidateResources = memos.filter(
    (memo) => memo.category === "RESOURCE" && getDaysOld(memo.updatedAt) >= 30,
  );
  const completedProjects = projects.filter((project) => {
    const memo = memos.find((item) => item.id === project.memoId);
    return memo?.category === "PROJECT" && project.status === "done";
  });

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
              주간 리뷰
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              마지막 완료: {lastReviewAt ? formatDateTime(lastReviewAt) : "아직 없음"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCompleteReview}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          >
            주간 리뷰 완료
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewPanel title="오래된 Inbox" count={oldInbox.length}>
          {oldInbox.map((memo) => (
            <ReviewMemoRow
              key={memo.id}
              title={memo.title}
              caption={`생성 ${formatDate(memo.createdAt)}`}
              actionLabel="Project"
              onAction={() => onMoveMemo(memo.id, "PROJECT")}
            />
          ))}
        </ReviewPanel>

        <ReviewPanel title="멈춘 Project" count={stalledProjects.length}>
          {stalledProjects.map((project) => (
            <ReviewMemoRow
              key={project.id}
              title={project.title}
              caption={`최근 수정 ${formatDate(project.updatedAt)} · ${project.progress}%`}
            />
          ))}
        </ReviewPanel>

        <ReviewPanel
          title="Archive 후보 Resource"
          count={archiveCandidateResources.length}
        >
          {archiveCandidateResources.map((memo) => (
            <ReviewMemoRow
              key={memo.id}
              title={memo.title}
              caption={`최근 수정 ${formatDate(memo.updatedAt)}`}
              actionLabel="Archive"
              onAction={() => onMoveMemo(memo.id, "ARCHIVE")}
            />
          ))}
        </ReviewPanel>

        <ReviewPanel title="완료된 Project" count={completedProjects.length}>
          {completedProjects.map((project) => (
            <ReviewMemoRow
              key={project.id}
              title={project.title}
              caption={`완료 상태 · ${project.progress}%`}
              actionLabel="Archive"
              onAction={() => onMoveMemo(project.memoId, "ARCHIVE")}
            />
          ))}
        </ReviewPanel>
      </div>
    </section>
  );
}

function ReviewPanel({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-stone-900 dark:text-stone-50">{title}</h3>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {count === 0 ? (
          <p className="rounded-md bg-stone-50 px-3 py-4 text-sm text-stone-500 dark:bg-stone-950 dark:text-stone-400">
            확인할 항목이 없습니다.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function ReviewMemoRow({
  title,
  caption,
  actionLabel,
  onAction,
}: {
  title: string;
  caption: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-3 dark:bg-stone-950">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
          {title}
        </p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {caption}
        </p>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-md border border-emerald-100 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-900 dark:bg-stone-900 dark:text-emerald-200 dark:hover:bg-stone-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
