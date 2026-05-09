import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/para";
import type { Memo, MemoCategory, ProjectItem } from "@/types";
import { MemoCard } from "@/components/MemoCard";
import { ProjectCard } from "@/components/ProjectCard";

interface ParaBoardProps {
  memos: Memo[];
  projects: ProjectItem[];
  onMoveMemo: (memoId: string, category: MemoCategory) => void;
  onUpdateMemo: (
    memoId: string,
    updates: Partial<Pick<Memo, "rawText" | "title" | "summary" | "tags">>,
  ) => void;
  onDeleteMemo: (memoId: string) => void;
  onUpdateProject: (projectId: string, updates: Partial<ProjectItem>) => void;
}

export function ParaBoard({
  memos,
  projects,
  onMoveMemo,
  onUpdateMemo,
  onDeleteMemo,
  onUpdateProject,
}: ParaBoardProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-5">
      {CATEGORY_ORDER.map((category) => {
        const columnMemos = memos.filter((memo) => memo.category === category);

        return (
          <div
            key={category}
            className="min-w-0 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 dark:border-stone-700 dark:bg-stone-950"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                {CATEGORY_LABELS[category]}
              </h2>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-stone-900 dark:text-emerald-300">
                {columnMemos.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnMemos.length === 0 ? (
                <p className="rounded-md border border-dashed border-emerald-200 bg-white/70 px-3 py-5 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
                  비어 있음
                </p>
              ) : (
                columnMemos.map((memo) => {
                  const project = projects.find(
                    (item) => item.memoId === memo.id,
                  );

                  if (category === "PROJECT" && project) {
                    return (
                      <ProjectCard
                        key={memo.id}
                        project={project}
                        onUpdate={onUpdateProject}
                        onMove={onMoveMemo}
                        onDelete={onDeleteMemo}
                      />
                    );
                  }

                  return (
                    <MemoCard
                      key={memo.id}
                      memo={memo}
                      compact
                      hideInboxMove
                      onMove={onMoveMemo}
                      onUpdate={onUpdateMemo}
                      onDelete={onDeleteMemo}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
