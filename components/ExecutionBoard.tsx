"use client";

import { ProjectCard } from "@/components/ProjectCard";
import { getDaysOld } from "@/lib/date";
import type { Memo, MemoCategory, ProjectItem } from "@/types";

interface ExecutionBoardProps {
  memos: Memo[];
  projects: ProjectItem[];
  onUpdateProject: (projectId: string, updates: Partial<ProjectItem>) => void;
  onMoveMemo: (memoId: string, category: MemoCategory) => void;
  onDeleteMemo: (memoId: string) => void;
}

export function ExecutionBoard({
  memos,
  projects,
  onUpdateProject,
  onMoveMemo,
  onDeleteMemo,
}: ExecutionBoardProps) {
  const activeProjects = projects.filter((project) => {
    const memo = memos.find((item) => item.id === project.memoId);
    return memo?.category === "PROJECT";
  });
  const doneProjects = activeProjects.filter(
    (project) => project.status === "done" || project.progress === 100,
  );
  const stalledProjects = activeProjects.filter(
    (project) =>
      project.status !== "done" &&
      project.progress < 100 &&
      (project.status === "paused" || getDaysOld(project.updatedAt) >= 5),
  );
  const inProgressProjects = activeProjects.filter(
    (project) =>
      project.status !== "done" &&
      project.progress < 100 &&
      !stalledProjects.some((stalledProject) => stalledProject.id === project.id),
  );
  const todayTasks = activeProjects
    .filter((project) => project.status !== "done" && project.progress < 100)
    .flatMap((project) =>
      project.tasks
        .filter((task) => !task.completed)
        .map((task) => ({ project, task })),
    )
    .slice(0, 8);

  const toggleTask = (project: ProjectItem, taskId: string) => {
    onUpdateProject(project.id, {
      tasks: project.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    });
  };

  if (activeProjects.length === 0) {
    return (
      <section className="rounded-2xl border border-[#dfe7da] bg-white/86 px-6 py-12 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900/86">
        <p className="text-base font-semibold text-stone-900 dark:text-stone-50">
          아직 실행 항목이 없어요.
        </p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          메모를 Project로 정리하면 실행 보드에 표시돼요.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <ExecutionPanel title="오늘 할 일" count={todayTasks.length}>
        {todayTasks.map(({ project, task }) => (
          <label
            key={`${project.id}-${task.id}`}
            className="flex min-h-12 items-center gap-3 rounded-xl bg-stone-50 px-3 py-3 dark:bg-stone-950"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(project, task.id)}
              className="h-4 w-4 rounded border-stone-300 accent-emerald-600"
            />
            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm font-semibold text-stone-800 dark:text-stone-100">
                {task.title}
              </span>
              <span className="mt-1 block truncate text-xs text-stone-500 dark:text-stone-400">
                {project.title}
              </span>
            </span>
          </label>
        ))}
      </ExecutionPanel>

      <div className="grid gap-5 xl:grid-cols-3">
        <ExecutionPanel title="진행 중" count={inProgressProjects.length}>
          {inProgressProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={onUpdateProject}
              onMove={onMoveMemo}
              onDelete={onDeleteMemo}
            />
          ))}
        </ExecutionPanel>

        <ExecutionPanel title="멈춘 항목" count={stalledProjects.length}>
          {stalledProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={onUpdateProject}
              onMove={onMoveMemo}
              onDelete={onDeleteMemo}
            />
          ))}
        </ExecutionPanel>

        <ExecutionPanel title="완료됨" count={doneProjects.length}>
          {doneProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={onUpdateProject}
              onMove={onMoveMemo}
              onDelete={onDeleteMemo}
            />
          ))}
        </ExecutionPanel>
      </div>
    </section>
  );
}

function ExecutionPanel({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#dfe7da] bg-white/76 p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900/76">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">
          {title}
        </h2>
        <span className="rounded-full bg-[#eef5ea] px-2.5 py-1 text-xs font-bold text-[#426149] dark:bg-emerald-950 dark:text-emerald-200">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {count === 0 ? (
          <p className="rounded-xl bg-stone-50 px-3 py-4 text-sm text-stone-500 dark:bg-stone-950 dark:text-stone-400">
            표시할 항목이 없습니다.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
