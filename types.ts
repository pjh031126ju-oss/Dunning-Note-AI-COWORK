export type MemoCategory = "INBOX" | "PROJECT" | "AREA" | "RESOURCE" | "ARCHIVE";

export type ProjectStatus = "not_started" | "in_progress" | "paused" | "done";

export type ThemeMode = "light" | "dark";

export interface MemoAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface Memo {
  id: string;
  rawText: string;
  category: MemoCategory;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: MemoAttachment[];
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  memoId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  tasks: ProjectTask[];
  progress: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  memos: Memo[];
  projects: ProjectItem[];
  lastReviewAt?: string;
}
