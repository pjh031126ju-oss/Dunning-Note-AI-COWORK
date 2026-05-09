import type { MemoCategory, ProjectStatus } from "@/types";

export const CATEGORY_LABELS: Record<MemoCategory, string> = {
  INBOX: "Inbox",
  PROJECT: "Projects",
  AREA: "Areas",
  RESOURCE: "Resources",
  ARCHIVE: "Archive",
};

export const CATEGORY_KO_LABELS: Record<MemoCategory, string> = {
  INBOX: "인박스",
  PROJECT: "프로젝트",
  AREA: "영역",
  RESOURCE: "자료",
  ARCHIVE: "아카이브",
};

export const CATEGORY_BUTTON_LABELS: Record<MemoCategory, string> = {
  INBOX: "Inbox",
  PROJECT: "Project",
  AREA: "Area",
  RESOURCE: "Resource",
  ARCHIVE: "Archive",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "시작 전",
  in_progress: "진행 중",
  paused: "보류",
  done: "완료",
};

export const CATEGORY_ORDER: MemoCategory[] = [
  "INBOX",
  "PROJECT",
  "AREA",
  "RESOURCE",
  "ARCHIVE",
];
