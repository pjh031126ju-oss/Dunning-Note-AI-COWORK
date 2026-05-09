import { formatDate, getDaysOld } from "@/lib/date";
import { CATEGORY_KO_LABELS } from "@/lib/para";
import type { Memo, MemoCategory, ProjectItem } from "@/types";

interface DashboardSummaryProps {
  memos: Memo[];
  projects: ProjectItem[];
}

const summaryCategories: MemoCategory[] = [
  "INBOX",
  "PROJECT",
  "AREA",
  "RESOURCE",
  "ARCHIVE",
];

export function DashboardSummary({ memos, projects }: DashboardSummaryProps) {
  const activeProjects = projects.filter((project) => {
    const memo = memos.find((item) => item.id === project.memoId);
    return memo?.category === "PROJECT" && project.status !== "done";
  });

  const oldInboxCount = memos.filter(
    (memo) => memo.category === "INBOX" && getDaysOld(memo.createdAt) >= 7,
  ).length;
  const stalledProjectCount = activeProjects.filter(
    (project) => getDaysOld(project.updatedAt) >= 5,
  ).length;
  const oldResourceCount = memos.filter(
    (memo) => memo.category === "RESOURCE" && getDaysOld(memo.updatedAt) >= 30,
  ).length;

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCategories.map((category) => (
          <article
            key={category}
            className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
          >
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {CATEGORY_KO_LABELS[category]}
            </p>
            <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-50">
              {memos.filter((memo) => memo.category === category).length}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                진행 중인 프로젝트
              </h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                작업 체크리스트 기준으로 자동 계산됩니다.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {activeProjects.length === 0 ? (
              <p className="rounded-md bg-stone-50 px-3 py-4 text-sm text-stone-500 dark:bg-stone-950 dark:text-stone-400">
                진행 중인 프로젝트가 없습니다.
              </p>
            ) : (
              activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-md border border-stone-100 p-3 dark:border-stone-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {project.title}
                      </p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        최근 수정 {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-amber-100 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
            주간 리뷰 경고
          </h2>
          <div className="mt-4 space-y-3">
            <WarningRow
              label="7일 넘은 Inbox"
              value={oldInboxCount}
              tone={oldInboxCount > 0 ? "warning" : "good"}
            />
            <WarningRow
              label="5일간 멈춘 Project"
              value={stalledProjectCount}
              tone={stalledProjectCount > 0 ? "warning" : "good"}
            />
            <WarningRow
              label="30일 지난 Resource"
              value={oldResourceCount}
              tone={oldResourceCount > 0 ? "warning" : "good"}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

function WarningRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "warning";
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-stone-50 px-3 py-3 dark:bg-stone-950">
      <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
        {label}
      </span>
      <span
        className={
          tone === "warning"
            ? "rounded-md bg-amber-100 px-2 py-1 text-sm font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200"
            : "rounded-md bg-emerald-100 px-2 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        }
      >
        {value}
      </span>
    </div>
  );
}
