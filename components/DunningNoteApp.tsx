"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardSummary } from "@/components/DashboardSummary";
import { MemoCard } from "@/components/MemoCard";
import { ParaBoard } from "@/components/ParaBoard";
import { QuickCapture } from "@/components/QuickCapture";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WeeklyReview } from "@/components/WeeklyReview";
import {
  calculateProgress,
  createId,
  createProjectFromMemo,
  createSummary,
  createTitle,
  loadState,
  saveState,
} from "@/lib/storage";
import type { AppState, Memo, MemoCategory, ProjectItem } from "@/types";

type ViewId = "capture" | "dashboard" | "inbox" | "para" | "review";

const menuItems: Array<{ id: ViewId; label: string }> = [
  { id: "capture", label: "메모하기" },
  { id: "dashboard", label: "대시보드" },
  { id: "inbox", label: "Inbox" },
  { id: "para", label: "PARA" },
  { id: "review", label: "주간 리뷰" },
];

export function DunningNoteApp() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("capture");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);

  const inboxMemos = useMemo(
    () => state?.memos.filter((memo) => memo.category === "INBOX") ?? [],
    [state],
  );

  const openView = (viewId: ViewId) => {
    setActiveView(viewId);
    setIsMenuOpen(false);
  };

  const createMemo = (rawText: string) => {
    const timestamp = new Date().toISOString();
    const memo: Memo = {
      id: createId("memo"),
      rawText: rawText.trim(),
      category: "INBOX",
      title: createTitle(rawText),
      summary: createSummary(rawText),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setState((current) =>
      current
        ? {
            ...current,
            memos: [memo, ...current.memos],
          }
        : current,
    );
    setActiveView("para");
  };

  const moveMemo = (memoId: string, category: MemoCategory) => {
    setState((current) => {
      if (!current) {
        return current;
      }

      const memo = current.memos.find((item) => item.id === memoId);
      if (!memo) {
        return current;
      }

      const updatedAt = new Date().toISOString();
      const updatedMemo: Memo = { ...memo, category, updatedAt };
      const memos = current.memos.map((item) =>
        item.id === memoId ? updatedMemo : item,
      );
      const hasProject = current.projects.some(
        (project) => project.memoId === memoId,
      );
      const projects =
        category === "PROJECT" && !hasProject
          ? [...current.projects, createProjectFromMemo(updatedMemo)]
          : current.projects;

      return {
        ...current,
        memos,
        projects,
      };
    });
  };

  const updateMemo = (
    memoId: string,
    updates: Partial<Pick<Memo, "rawText" | "title" | "summary" | "tags">>,
  ) => {
    setState((current) => {
      if (!current) {
        return current;
      }

      const updatedAt = new Date().toISOString();

      return {
        ...current,
        memos: current.memos.map((memo) =>
          memo.id === memoId ? { ...memo, ...updates, updatedAt } : memo,
        ),
      };
    });
  };

  const deleteMemo = (memoId: string) => {
    setState((current) =>
      current
        ? {
            ...current,
            memos: current.memos.filter((memo) => memo.id !== memoId),
            projects: current.projects.filter(
              (project) => project.memoId !== memoId,
            ),
          }
        : current,
    );
  };

  const updateProject = (projectId: string, updates: Partial<ProjectItem>) => {
    setState((current) => {
      if (!current) {
        return current;
      }

      const updatedAt = new Date().toISOString();

      return {
        ...current,
        projects: current.projects.map((project) => {
          if (project.id !== projectId) {
            return project;
          }

          const nextTasks = updates.tasks ?? project.tasks;

          return {
            ...project,
            ...updates,
            tasks: nextTasks,
            progress: calculateProgress(nextTasks),
            updatedAt,
          };
        }),
      };
    });
  };

  const completeWeeklyReview = () => {
    setState((current) =>
      current
        ? {
            ...current,
            lastReviewAt: new Date().toISOString(),
          }
        : current,
    );
  };

  if (!state) {
    return (
      <main className="min-h-screen bg-[#f5f7f1] px-4 py-8 text-stone-900 dark:bg-stone-950 dark:text-stone-50">
        <div className="mx-auto max-w-7xl rounded-lg border border-emerald-100 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          더닝노트를 불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f1] px-4 text-stone-900 transition-colors dark:bg-[#101713] dark:text-stone-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative z-30 flex items-center justify-between py-4">
          <div className="relative">
            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-100 bg-white text-stone-700 shadow-sm transition hover:bg-emerald-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <span className="flex flex-col gap-1.5" aria-hidden="true">
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            {isMenuOpen ? (
              <div className="absolute left-0 top-12 w-52 rounded-lg border border-stone-100 bg-white p-2 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openView(item.id)}
                    className={
                      activeView === item.id
                        ? "block w-full rounded-md bg-emerald-50 px-3 py-2 text-left text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        : "block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => openView("capture")}
            className="text-sm font-bold text-stone-700 transition hover:text-emerald-700 dark:text-stone-200 dark:hover:text-emerald-300"
          >
            더닝노트
          </button>

          <ThemeToggle />
        </header>

        {activeView === "capture" ? (
          <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-3xl flex-col items-center justify-center pb-20">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-stone-950 dark:text-stone-50 sm:text-5xl">
                Dunning Note AI
              </h1>
              <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                메모를 던지면 Inbox에 저장되고 PARA로 이동합니다.
              </p>
            </div>
            <QuickCapture onCreateMemo={createMemo} variant="hero" />
          </section>
        ) : null}

        {activeView === "dashboard" ? (
          <section className="space-y-5 py-4">
            <ViewHeader title="대시보드" />
            <DashboardSummary memos={state.memos} projects={state.projects} />
          </section>
        ) : null}

        {activeView === "inbox" ? (
          <section className="space-y-4 py-4">
            <ViewHeader title="Inbox" />
            <QuickCapture onCreateMemo={createMemo} />
            <div className="grid gap-4 lg:grid-cols-2">
              {inboxMemos.length === 0 ? (
                <p className="rounded-lg border border-emerald-100 bg-white px-4 py-8 text-center text-sm text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 lg:col-span-2">
                  Inbox가 비어 있습니다.
                </p>
              ) : (
                inboxMemos.map((memo) => (
                  <MemoCard
                    key={memo.id}
                    memo={memo}
                    showDecisionHelper
                    onMove={moveMemo}
                    onUpdate={updateMemo}
                    onDelete={deleteMemo}
                  />
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeView === "para" ? (
          <section className="space-y-4 py-4">
            <ViewHeader title="PARA" />
            <ParaBoard
              memos={state.memos}
              projects={state.projects}
              onMoveMemo={moveMemo}
              onUpdateMemo={updateMemo}
              onDeleteMemo={deleteMemo}
              onUpdateProject={updateProject}
            />
          </section>
        ) : null}

        {activeView === "review" ? (
          <section className="space-y-4 py-4">
            <ViewHeader title="주간 리뷰" />
            <WeeklyReview
              memos={state.memos}
              projects={state.projects}
              lastReviewAt={state.lastReviewAt}
              onMoveMemo={moveMemo}
              onCompleteReview={completeWeeklyReview}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function ViewHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-stone-950 dark:text-stone-50">
        {title}
      </h1>
    </div>
  );
}
