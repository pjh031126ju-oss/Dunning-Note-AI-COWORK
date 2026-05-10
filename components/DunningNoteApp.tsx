"use client";

import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardSummary } from "@/components/DashboardSummary";
import { HeroCapture } from "@/components/HeroCapture";
import { MenuDrawer, type DrawerViewId } from "@/components/MenuDrawer";
import { MemoCard } from "@/components/MemoCard";
import { ParaBoard } from "@/components/ParaBoard";
import { ProjectCard } from "@/components/ProjectCard";
import { ProfileMenu } from "@/components/ProfileMenu";
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
  STORAGE_KEY,
  THEME_KEY,
} from "@/lib/storage";
import type {
  AppState,
  Memo,
  MemoAttachment,
  MemoCategory,
  ProjectItem,
  ThemeMode,
} from "@/types";

type ViewId = DrawerViewId;

export function DunningNoteApp() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("capture");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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
  const isCaptureView = activeView === "capture";

  const openView = (viewId: ViewId) => {
    setActiveView(viewId);
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const changeTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const createMemo = (
    rawText: string,
    attachments: MemoAttachment[] = [],
  ) => {
    const timestamp = new Date().toISOString();
    const memo: Memo = {
      id: createId("memo"),
      rawText: rawText.trim(),
      category: "INBOX",
      title: createTitle(rawText),
      summary: createSummary(rawText),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(attachments.length > 0 ? { attachments } : {}),
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

  const openSettingsFromProfile = () => {
    setIsMenuOpen(true);
  };

  const exportLocalData = () => {
    if (!state) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      storageKey: STORAGE_KEY,
      theme: window.localStorage.getItem(THEME_KEY) ?? theme,
      state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `dunning-note-ai-data-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const showGuestLoginNotice = () => {
    window.alert("로그인 / 회원가입은 다음 단계에서 연결할 예정입니다.");
  };

  const showDataManageNotice = () => {
    window.alert(
      "현재 MVP는 브라우저 localStorage에만 데이터를 저장합니다. 백업은 데이터 내보내기를 사용하세요.",
    );
  };

  const showHelpNotice = () => {
    window.alert("도움말 / 피드백 패널은 곧 추가할 예정입니다.");
  };

  const showPrivacyNotice = () => {
    window.alert("개인정보 처리방침은 정식 서비스 단계에서 제공됩니다.");
  };

  const showTermsNotice = () => {
    window.alert("서비스 이용약관은 정식 서비스 단계에서 제공됩니다.");
  };

  const showVersionNotice = () => {
    window.alert("Dunning Note AI MVP v0.1.0");
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
    <main
      className={
        isCaptureView
          ? "relative min-h-screen overflow-hidden bg-[#f7f8f4] font-sans text-stone-950 transition-colors dark:bg-[#131314] dark:text-white"
          : "relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbfaf4_0%,#f2f7ee_100%)] text-stone-900 transition-colors dark:bg-[linear-gradient(180deg,#101713_0%,#172018_100%)] dark:text-stone-50"
      }
    >
      {!isCaptureView ? (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[rgba(133,165,132,0.18)] blur-3xl dark:bg-[rgba(58,100,72,0.18)]" />
          <div className="pointer-events-none absolute bottom-0 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[rgba(204,216,188,0.36)] blur-3xl dark:bg-[rgba(37,68,49,0.24)]" />
        </>
      ) : null}
      <DunningCurveBackground />

      <header className="relative z-30 px-4 py-4 sm:px-8">
        {isCaptureView ? (
          <nav className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="메뉴 열기"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(true)}
                className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20 dark:text-gray-400 dark:hover:bg-[#282a2c] dark:hover:text-white dark:focus-visible:ring-white/20"
              >
                <Menu size={24} />
              </button>
              <button
                type="button"
                onClick={() => openView("capture")}
                className="flex items-center gap-2 rounded-xl pr-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                  <span className="text-lg font-bold leading-none tracking-tighter text-white">
                    DN
                  </span>
                </span>
                <span className="text-base font-semibold tracking-wide text-stone-800 dark:text-gray-200 sm:text-xl">
                  Dunning Note
                </span>
              </button>
            </div>

            <ProfileMenu
              isOpen={isProfileMenuOpen}
              onToggle={() => setIsProfileMenuOpen((current) => !current)}
              onClose={() => setIsProfileMenuOpen(false)}
              onOpenSettings={openSettingsFromProfile}
              onExportData={exportLocalData}
              onLoginClick={showGuestLoginNotice}
              onDataManageClick={showDataManageNotice}
              onHelpClick={showHelpNotice}
              onPrivacyClick={showPrivacyNotice}
              onTermsClick={showTermsNotice}
              onVersionClick={showVersionNotice}
            />
          </nav>
        ) : (
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
        )}
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
          <section className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-3xl flex-col items-center justify-center px-0 pb-32">
            <div className="absolute left-1/4 top-1/4 -z-10 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-900/10" />
            <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-900/10" />

            <div className="mb-10 w-full text-center">
              <h1 className="text-4xl font-semibold leading-tight text-stone-950 dark:text-white sm:text-5xl">
                메모를 실행으로 바꿔드릴게요.
              </h1>
            </div>

            <HeroCapture onCreateMemo={createMemo} variant="landing" />

            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-stone-500 dark:text-gray-500">
              Inbox에 저장되고 PARA로 정리됩니다.
            </div>
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

function DunningCurveBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-24 z-0 flex justify-center opacity-30 dark:opacity-20"
    >
      <svg
        viewBox="0 0 960 360"
        className="h-[28rem] w-[80rem] max-w-none text-[#6f8f73] dark:text-emerald-300"
        fill="none"
      >
        <path
          d="M70 300 C135 34 224 32 286 112 C347 190 334 318 430 318 C548 318 584 190 694 166 C793 144 848 92 900 58"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
          strokeDasharray="10 16"
        />
        <path
          d="M70 300 C135 34 224 32 286 112 C347 190 334 318 430 318 C548 318 584 190 694 166 C793 144 848 92 900 58"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="18"
          strokeOpacity="0.08"
        />
      </svg>
    </div>
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
