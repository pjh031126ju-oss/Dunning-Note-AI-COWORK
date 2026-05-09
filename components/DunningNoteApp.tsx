"use client";

import { Edit, Menu, Moon, Settings, Sun } from "lucide-react";
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
type PlanId = "free" | "pro" | "team" | "enterprise";

const PLAN_OPTIONS: Array<{
  id: PlanId;
  label: string;
  price: string;
  description: string;
}> = [
  {
    id: "free",
    label: "FREE",
    price: "₩0",
    description: "개인 메모와 기본 PARA 정리",
  },
  {
    id: "pro",
    label: "PRO",
    price: "₩9,900",
    description: "AI 자동 분류와 주간 리뷰 강화",
  },
  {
    id: "team",
    label: "TEAM",
    price: "₩29,000",
    description: "팀 보드, 공유 프로젝트, 역할 관리",
  },
  {
    id: "enterprise",
    label: "ENTERPRISE",
    price: "문의",
    description: "보안, SSO, 조직 단위 워크스페이스",
  },
];

const PROFILE_ACTIONS = [
  "프로필 설정",
  "계정 및 보안",
  "알림 설정",
  "데이터 내보내기",
  "로그아웃",
];

export function DunningNoteApp() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("capture");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("free");
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
    setIsPlanMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const changeTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const selectPlan = (planId: PlanId) => {
    setSelectedPlan(planId);
    setIsPlanMenuOpen(false);
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
                  <span className="absolute right-0 top-0 h-2 w-2 translate-x-1/3 -translate-y-1/3 animate-pulse rounded-full bg-yellow-300" />
                </span>
                <span className="text-xl font-semibold tracking-wide text-stone-800 dark:text-gray-200">
                  Dunning Note
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={theme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"}
                aria-pressed={theme === "dark"}
                onClick={() => changeTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20 dark:border-gray-700 dark:bg-[#1e1f20] dark:text-gray-300 dark:hover:bg-[#282a2c] dark:hover:text-white dark:focus-visible:ring-white/20"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isPlanMenuOpen}
                  onClick={() => {
                    setIsPlanMenuOpen((current) => !current);
                    setIsProfileMenuOpen(false);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20 dark:border-gray-700 dark:bg-[#1e1f20] dark:text-gray-300 dark:hover:bg-[#282a2c] dark:hover:text-white dark:focus-visible:ring-white/20"
                >
                  {PLAN_OPTIONS.find((plan) => plan.id === selectedPlan)?.label}
                </button>
                {isPlanMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-[#1e1f20]"
                  >
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-gray-500">
                      구독 플랜
                    </p>
                    {PLAN_OPTIONS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={selectedPlan === plan.id}
                        onClick={() => selectPlan(plan.id)}
                        className={
                          selectedPlan === plan.id
                            ? "block w-full rounded-xl bg-stone-950 px-3 py-3 text-left text-white dark:bg-white dark:text-black"
                            : "block w-full rounded-xl px-3 py-3 text-left text-stone-700 transition-colors hover:bg-stone-100 dark:text-gray-300 dark:hover:bg-[#282a2c]"
                        }
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">
                            {plan.label}
                          </span>
                          <span className="text-xs opacity-70">{plan.price}</span>
                        </span>
                        <span className="mt-1 block text-xs opacity-70">
                          {plan.description}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <button
                  type="button"
                  aria-label="프로필 설정"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  onClick={() => {
                    setIsProfileMenuOpen((current) => !current);
                    setIsPlanMenuOpen(false);
                  }}
                  className="h-8 w-8 rounded-full border-2 border-[#f7f8f4] bg-gradient-to-r from-cyan-400 to-blue-500 ring-2 ring-blue-500/40 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 dark:border-[#131314] dark:ring-blue-500/50"
                />
                {isProfileMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-40 w-72 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl dark:border-gray-800 dark:bg-[#1e1f20]"
                  >
                    <div className="flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-gray-800">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-950 dark:text-white">
                          정재현
                        </p>
                        <p className="truncate text-xs text-stone-500 dark:text-gray-400">
                          jaehyun@dunning-note.local
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {PROFILE_ACTIONS.map((action) => (
                        <button
                          key={action}
                          type="button"
                          role="menuitem"
                          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-gray-300 dark:hover:bg-[#282a2c]"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
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

      {isCaptureView ? (
        <>
          <aside className="fixed left-0 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 p-4 md:flex">
            <button
              type="button"
              aria-label="새 메모"
              className="rounded-full border border-stone-200 bg-white p-3 text-stone-500 shadow-sm transition-colors hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20 dark:border-gray-800 dark:bg-[#1e1f20] dark:text-gray-400 dark:hover:bg-[#282a2c] dark:hover:text-white dark:focus-visible:ring-white/20"
            >
              <Edit size={20} />
            </button>
          </aside>
          <div className="fixed bottom-4 left-4 z-20 hidden md:block">
            <button
              type="button"
              aria-label="설정"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-full p-3 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20 dark:text-gray-400 dark:hover:bg-[#282a2c] dark:hover:text-white dark:focus-visible:ring-white/20"
            >
              <Settings size={20} />
            </button>
          </div>
        </>
      ) : null}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeView === "capture" ? (
          <section className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-3xl flex-col items-center justify-center px-0 pb-32">
            <div className="absolute left-1/4 top-1/4 -z-10 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-900/10" />
            <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-900/10" />

            <div className="mb-12 w-full text-center">
              <h2 className="mb-2 text-2xl font-medium tracking-tight text-stone-500 dark:text-gray-400">
                정재현님, 안녕하세요
              </h2>
              <h1 className="text-4xl font-semibold leading-tight text-stone-950 dark:text-white sm:text-5xl">
                메모를 실행으로 바꿔드릴게요.
              </h1>
            </div>

            <HeroCapture onCreateMemo={createMemo} variant="landing" />

            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-stone-500 dark:text-gray-500">
              Inbox에 저장되고 PARA 방법론에 따라 AI가 자동 정리합니다.
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
