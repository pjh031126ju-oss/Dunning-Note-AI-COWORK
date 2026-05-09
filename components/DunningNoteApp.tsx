"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardSummary } from "@/components/DashboardSummary";
import { HeroCapture } from "@/components/HeroCapture";
import { MenuDrawer, type DrawerViewId } from "@/components/MenuDrawer";
import { MemoCard } from "@/components/MemoCard";
import { ParaBoard } from "@/components/ParaBoard";
import { ProjectCard } from "@/components/ProjectCard";
import { QuickCapture } from "@/components/QuickCapture";
import { WeeklyReview } from "@/components/WeeklyReview";
import {
  calculateProgress,
  createId,
  createProjectFromMemo,
  createSummary,
  createTitle,
  loadState,
  saveState,
  THEME_KEY,
} from "@/lib/storage";
import type {
  AppState,
  Memo,
  MemoCategory,
  ProjectItem,
  ThemeMode,
} from "@/types";

type ViewId = DrawerViewId;

export function DunningNoteApp() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("capture");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    setState(loadState());
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const nextTheme: ThemeMode = storedTheme === "dark" ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
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

  const changeTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
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
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbfaf4_0%,#f2f7ee_100%)] text-stone-900 transition-colors dark:bg-[linear-gradient(180deg,#101713_0%,#172018_100%)] dark:text-stone-50">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[rgba(133,165,132,0.18)] blur-3xl dark:bg-[rgba(58,100,72,0.18)]" />
      <div className="pointer-events-none absolute bottom-0 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[rgba(204,216,188,0.36)] blur-3xl dark:bg-[rgba(37,68,49,0.24)]" />

      <header className="relative z-30 px-5 py-6 sm:px-8">
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
          className="flex w-8 flex-col gap-1.5 text-[#1f2b22] opacity-90 transition hover:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-stone-100 dark:focus-visible:ring-emerald-900"
        >
          <span className="h-0.5 w-7 rounded-full bg-current" />
          <span className="h-0.5 w-7 rounded-full bg-current" />
          <span className="h-0.5 w-7 rounded-full bg-current" />
        </button>
      </header>

      <MenuDrawer
        activeView={activeView}
        isOpen={isMenuOpen}
        theme={theme}
        onClose={() => setIsMenuOpen(false)}
        onOpenView={openView}
        onThemeChange={changeTheme}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeView === "capture" ? (
          <>
            <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl flex-col items-center justify-center pb-20 pt-2">
              <div className="mb-8 text-center">
                <div className="mb-5 text-xl text-[#708c72] dark:text-emerald-300">
                  ✦
                </div>
                <h1 className="font-display-serif text-6xl font-semibold leading-[0.9] text-[#1e2a22] dark:text-stone-100 sm:text-8xl lg:text-9xl">
                  <span>Dunning Note </span>
                  <span className="text-[#6f8f73] dark:text-emerald-300">
                    AI
                  </span>
                </h1>
                <p className="mt-7 text-xl font-medium text-[#3d4a40] dark:text-stone-300 sm:text-2xl">
                  흩어진 메모를 실행으로.
                </p>
              </div>

              <HeroCapture onCreateMemo={createMemo} />

              <p className="mt-5 text-sm text-stone-500 dark:text-stone-400">
                ✦ Inbox에 저장되고 PARA로 정리됩니다.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 text-sm font-medium text-stone-500 dark:text-stone-400 sm:flex-row sm:gap-6">
                {["빠르게 캡처", "PARA로 정리", "실행으로 연결"].map((hint) => (
                  <span key={hint} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8fab91]" />
                    {hint}
                  </span>
                ))}
              </div>
            </section>

            <section className="pb-16 pt-4">
              <DashboardSummary memos={state.memos} projects={state.projects} />
            </section>
          </>
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

        {activeView === "projects" ? (
          <section className="space-y-4 py-4">
            <ViewHeader title="Projects" />
            <div className="grid gap-4 lg:grid-cols-2">
              {state.projects.length === 0 ? (
                <p className="rounded-lg border border-emerald-100 bg-white px-4 py-8 text-center text-sm text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 lg:col-span-2">
                  프로젝트가 없습니다.
                </p>
              ) : (
                state.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUpdate={updateProject}
                    onMove={moveMemo}
                    onDelete={deleteMemo}
                  />
                ))
              )}
            </div>
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
