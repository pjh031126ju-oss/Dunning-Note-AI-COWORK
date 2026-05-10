"use client";

import { Menu } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AllMemosView } from "@/components/AllMemosView";
import { ArchiveView } from "@/components/ArchiveView";
import { ExecutionBoard } from "@/components/ExecutionBoard";
import { HelpFeedbackView } from "@/components/HelpFeedbackView";
import { HeroCapture } from "@/components/HeroCapture";
import { MenuDrawer, type DrawerViewId } from "@/components/MenuDrawer";
import { ParaBoard } from "@/components/ParaBoard";
import { ProfileMenu } from "@/components/ProfileMenu";
import { SearchView } from "@/components/SearchView";
import { SettingsPanel } from "@/components/SettingsPanel";
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
import { getDaysOld } from "@/lib/date";

type ViewId = DrawerViewId;

const getResolvedTheme = (mode: ThemeMode) => {
  if (mode !== "system") {
    return mode;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyThemeMode = (mode: ThemeMode) => {
  document.documentElement.classList.toggle(
    "dark",
    getResolvedTheme(mode) === "dark",
  );
};

const isAppState = (value: unknown): value is AppState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AppState>;
  return Array.isArray(candidate.memos) && Array.isArray(candidate.projects);
};

export function DunningNoteApp() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("capture");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(loadState());
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const nextTheme: ThemeMode =
      storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "light";

    setTheme(nextTheme);
    applyThemeMode(nextTheme);
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => applyThemeMode("system");

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  const inboxMemos = useMemo(
    () => state?.memos.filter((memo) => memo.category === "INBOX") ?? [],
    [state],
  );
  const activeProjects = useMemo(
    () =>
      state?.projects.filter((project) => {
        const memo = state.memos.find((item) => item.id === project.memoId);
        return (
          memo?.category === "PROJECT" &&
          project.status !== "done" &&
          project.progress < 100
        );
      }) ?? [],
    [state],
  );
  const reviewNeedCount = useMemo(() => {
    if (!state) {
      return 0;
    }

    const oldInboxCount = state.memos.filter(
      (memo) => memo.category === "INBOX" && getDaysOld(memo.createdAt) >= 7,
    ).length;
    const stalledProjectCount = state.projects.filter((project) => {
      const memo = state.memos.find((item) => item.id === project.memoId);
      return (
        memo?.category === "PROJECT" &&
        project.status !== "done" &&
        project.progress < 100 &&
        getDaysOld(project.updatedAt) >= 5
      );
    }).length;
    const archiveCandidateCount = state.memos.filter(
      (memo) => memo.category === "RESOURCE" && getDaysOld(memo.updatedAt) >= 30,
    ).length;

    return oldInboxCount + stalledProjectCount + archiveCandidateCount;
  }, [state]);
  const isCaptureView = activeView === "capture";

  const openView = (viewId: ViewId) => {
    setActiveView(viewId);
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsSettingsOpen(false);
  };

  const changeTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyThemeMode(nextTheme);
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
    setIsSettingsOpen(true);
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

  const openHelpFromProfile = () => {
    openView("help");
  };

  const openImportPicker = () => {
    importInputRef.current?.click();
  };

  const importLocalData = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const candidate = isAppState(parsed)
          ? parsed
          : parsed && typeof parsed === "object"
            ? (parsed as { state?: unknown }).state
            : null;

        if (!isAppState(candidate)) {
          window.alert("더닝노트 JSON 데이터 형식이 아닙니다.");
          return;
        }

        if (
          !window.confirm(
            "가져온 데이터로 현재 메모를 덮어쓸까요? 기존 데이터는 먼저 내보내기를 권장합니다.",
          )
        ) {
          return;
        }

        setState(candidate);
        window.alert("데이터를 가져왔습니다.");
      } catch {
        window.alert("JSON 파일을 읽지 못했습니다.");
      }
    };

    reader.readAsText(file);
  };

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (file) {
      importLocalData(file);
    }
    event.target.value = "";
  };

  const resetLocalData = () => {
    if (
      !window.confirm(
        "정말 모든 메모와 실행 항목을 초기화할까요? 이 작업은 되돌릴 수 없습니다.",
      )
    ) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setState({ memos: [], projects: [] });
    setActiveView("capture");
    setIsSettingsOpen(false);
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
              onImportData={openImportPicker}
              onResetData={resetLocalData}
              onLoginClick={showGuestLoginNotice}
              onHelpClick={openHelpFromProfile}
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
        onClose={() => setIsMenuOpen(false)}
        onOpenView={openView}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        theme={theme}
        onClose={() => setIsSettingsOpen(false)}
        onThemeChange={changeTheme}
        onExportData={exportLocalData}
        onImportData={openImportPicker}
        onResetData={resetLocalData}
      />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="sr-only"
        onChange={handleImportFileChange}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeView === "capture" ? (
          <section className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-5xl flex-col items-center justify-center px-0 pb-32">
            <div className="absolute left-1/4 top-1/4 -z-10 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-900/10" />
            <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-900/10" />

            <div className="mb-10 w-full text-center">
              <h1 className="font-display-serif text-6xl font-semibold leading-none text-[#1d2820] dark:text-stone-50 sm:text-8xl lg:text-9xl">
                Dunning Note <span className="text-[#6f8f73]">AI</span>
              </h1>
              <p className="mt-5 text-sm font-medium leading-6 text-stone-500 dark:text-stone-400 sm:text-base">
                메모를 실행으로 바꿔드릴게요.
              </p>
            </div>

            <div className="w-full max-w-3xl">
              <HeroCapture onCreateMemo={createMemo} variant="landing" />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-stone-500 dark:text-gray-500">
              Inbox에 저장되고 PARA로 정리됩니다.
            </div>
          </section>
        ) : null}

        {activeView === "capture" ? (
          <HomeSummaryStrip
            totalMemoCount={state.memos.length}
            inboxMemoCount={inboxMemos.length}
            activeProjectCount={activeProjects.length}
            reviewNeedCount={reviewNeedCount}
          />
        ) : null}

        {activeView === "all-memos" ? (
          <section className="space-y-4 py-4">
            <ViewHeader
              title="전체 메모"
              description="기록한 모든 메모를 한곳에서 보고, 미분류와 첨부 메모를 빠르게 걸러봅니다."
            />
            <AllMemosView
              memos={state.memos}
              projects={state.projects}
              onMove={moveMemo}
              onUpdate={updateMemo}
              onDelete={deleteMemo}
              onOpenHome={() => openView("capture")}
            />
          </section>
        ) : null}

        {activeView === "search" ? (
          <section className="space-y-4 py-4">
            <ViewHeader
              title="검색"
              description="제목, 내용, 요약, 태그를 기준으로 메모를 찾습니다."
            />
            <SearchView
              memos={state.memos}
              onMove={moveMemo}
              onUpdate={updateMemo}
              onDelete={deleteMemo}
            />
          </section>
        ) : null}

        {activeView === "para" ? (
          <section className="space-y-4 py-4">
            <ViewHeader
              title="PARA 보드"
              description="메모를 Project, Area, Resource, Archive로 정리합니다."
            />
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

        {activeView === "execution" ? (
          <section className="space-y-4 py-4">
            <ViewHeader
              title="실행 보드"
              description="Project로 정리된 메모를 오늘 할 일, 진행 중, 멈춘 항목, 완료됨으로 봅니다."
            />
            <ExecutionBoard
              memos={state.memos}
              projects={state.projects}
              onUpdateProject={updateProject}
              onMoveMemo={moveMemo}
              onDeleteMemo={deleteMemo}
            />
          </section>
        ) : null}

        {activeView === "review" ? (
          <section className="space-y-4 py-4">
            <ViewHeader
              title="주간 리뷰"
              description="오래된 메모와 멈춘 실행 항목, 보관 후보를 정리합니다."
            />
            <WeeklyReview
              memos={state.memos}
              projects={state.projects}
              lastReviewAt={state.lastReviewAt}
              onMoveMemo={moveMemo}
              onCompleteReview={completeWeeklyReview}
            />
          </section>
        ) : null}

        {activeView === "archive" ? (
          <section className="space-y-4 py-4">
            <ViewHeader
              title="Archive"
              description="완료되었거나 당장 필요하지 않은 메모를 보관합니다."
            />
            <ArchiveView
              memos={state.memos}
              onRestore={(memoId) => moveMemo(memoId, "INBOX")}
              onDelete={deleteMemo}
            />
          </section>
        ) : null}

        {activeView === "help" ? (
          <section className="space-y-4 py-4">
            <ViewHeader
              title="도움말 / 피드백"
              description="더닝노트의 저장 방식과 PARA 흐름을 확인합니다."
            />
            <HelpFeedbackView />
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

function HomeSummaryStrip({
  totalMemoCount,
  inboxMemoCount,
  activeProjectCount,
  reviewNeedCount,
}: {
  totalMemoCount: number;
  inboxMemoCount: number;
  activeProjectCount: number;
  reviewNeedCount: number;
}) {
  const items = [
    { label: "전체 메모 수", value: totalMemoCount },
    { label: "미분류 메모 수", value: inboxMemoCount },
    { label: "진행 중 실행 항목 수", value: activeProjectCount },
    { label: "주간 리뷰 필요 항목 수", value: reviewNeedCount },
  ];

  return (
    <section className="mx-auto grid max-w-5xl gap-3 pb-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-2xl border border-[#dfe7da] bg-white/70 p-4 shadow-sm backdrop-blur dark:border-stone-700 dark:bg-stone-900/70"
        >
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            {item.label}
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-50">
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}

function ViewHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-950 dark:text-stone-50">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 dark:text-stone-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}
