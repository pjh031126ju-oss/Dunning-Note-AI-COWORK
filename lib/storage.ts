import type { AppState, Memo, MemoCategory, ProjectItem } from "@/types";

export const STORAGE_KEY = "dunning-note-ai-state-v1";
export const THEME_KEY = "dunning-note-ai-theme";

const nowIso = () => new Date().toISOString();

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createTitle = (text: string) => {
  const [firstLine] = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const cleanText = (firstLine ?? text).trim().replace(/\s+/g, " ");
  if (!cleanText) {
    return "제목 없는 메모";
  }

  return cleanText.length > 20 ? `${cleanText.slice(0, 20)}...` : cleanText;
};

export const createSummary = (text: string) => {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const contentLines = lines.length > 1 ? lines.slice(1) : lines;
  const cleanText = contentLines.join(" ").trim().replace(/\s+/g, " ");
  if (!cleanText) {
    return "요약할 내용이 없습니다.";
  }

  return cleanText.length > 80 ? `${cleanText.slice(0, 80)}...` : cleanText;
};

const makeMemo = (
  rawText: string,
  category: MemoCategory,
  createdAt: string,
  tags?: string[],
): Memo => ({
  id: createId("memo"),
  rawText,
  category,
  title: createTitle(rawText),
  summary: createSummary(rawText),
  createdAt,
  updatedAt: createdAt,
  tags,
});

export const calculateProgress = (tasks: ProjectItem["tasks"]) => {
  // Projects do not store manual progress; task completion is the source of truth.
  if (tasks.length === 0) {
    return 0;
  }

  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

export const createProjectFromMemo = (memo: Memo): ProjectItem => ({
  id: createId("project"),
  memoId: memo.id,
  title: memo.title,
  description: memo.summary,
  status: "not_started",
  tasks: [],
  progress: 0,
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

export const createSeedState = (): AppState => {
  // Seed data makes the first local run feel like a real PARA workspace.
  const projectMemo = makeMemo(
    "선형대수 기말 대비해서 가우스 조던, LU, QR 복습하기",
    "PROJECT",
    daysAgo(6),
  );
  const areaMemo = makeMemo("자취 식비를 매주 관리해야 함", "AREA", daysAgo(4), [
    "돈 관리",
    "자취 생활",
  ]);
  const resourceMemo = makeMemo("PARA 메모법 정리 자료", "RESOURCE", daysAgo(36), [
    "PARA",
    "자료",
  ]);
  const archiveMemo = makeMemo("끝난 과제 제출 기록", "ARCHIVE", daysAgo(18));

  const project: ProjectItem = {
    ...createProjectFromMemo(projectMemo),
    status: "in_progress",
    tasks: [
      {
        id: createId("task"),
        title: "가우스 조던 소거법 예제 5개 풀기",
        completed: true,
        createdAt: daysAgo(6),
      },
      {
        id: createId("task"),
        title: "LU 분해 공식 정리하기",
        completed: false,
        createdAt: daysAgo(5),
      },
      {
        id: createId("task"),
        title: "QR 분해 개념 노트 만들기",
        completed: false,
        createdAt: daysAgo(5),
      },
    ],
    updatedAt: daysAgo(6),
  };

  project.progress = calculateProgress(project.tasks);

  return {
    memos: [projectMemo, areaMemo, resourceMemo, archiveMemo],
    projects: [project],
  };
};

export const loadState = (): AppState => {
  if (typeof window === "undefined") {
    return createSeedState();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(stored) as AppState;
  } catch {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

export const saveState = (state: AppState) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};
