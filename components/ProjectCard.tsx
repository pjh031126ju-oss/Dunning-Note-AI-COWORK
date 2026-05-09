"use client";

import { useState } from "react";
import { CardActionsMenu } from "@/components/CardActionsMenu";
import { formatDateTime } from "@/lib/date";
import { CATEGORY_BUTTON_LABELS, CATEGORY_ORDER } from "@/lib/para";
import { createId } from "@/lib/storage";
import type { MemoCategory, ProjectItem, ProjectTask } from "@/types";

interface ProjectCardProps {
  project: ProjectItem;
  onUpdate: (projectId: string, updates: Partial<ProjectItem>) => void;
  onMove: (memoId: string, category: MemoCategory) => void;
  onDelete: (memoId: string) => void;
}

export function ProjectCard({
  project,
  onUpdate,
  onMove,
  onDelete,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const moveActions = CATEGORY_ORDER.filter(
    (category) => category !== "PROJECT" && category !== "INBOX",
  ).map((category) => ({
    category,
    label: CATEGORY_BUTTON_LABELS[category],
  }));

  const saveProject = () => {
    onUpdate(project.id, {
      title: title.trim() || "제목 없는 프로젝트",
      description: description.trim(),
    });
    setIsEditing(false);
  };

  const addTask = () => {
    const cleanTitle = newTaskTitle.trim();

    if (!cleanTitle) {
      return;
    }

    const task: ProjectTask = {
      id: createId("task"),
      title: cleanTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onUpdate(project.id, {
      tasks: [...project.tasks, task],
      status: project.status === "not_started" ? "in_progress" : project.status,
    });
    setNewTaskTitle("");
  };

  const toggleTask = (taskId: string) => {
    onUpdate(project.id, {
      tasks: project.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    });
  };

  const deleteTask = (taskId: string) => {
    onUpdate(project.id, {
      tasks: project.tasks.filter((task) => task.id !== taskId),
    });
  };

  return (
    <article className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-stone-700 dark:bg-stone-900">
      <div className="flex justify-end">
        <div>
          {!isEditing ? (
            <CardActionsMenu
              label="프로젝트 작업 메뉴"
              moveActions={moveActions}
              onMove={(category) => onMove(project.memoId, category)}
              onEdit={() => setIsEditing(true)}
              onDelete={() => onDelete(project.memoId)}
            />
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-emerald-950"
            placeholder="프로젝트 제목"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-emerald-950"
            placeholder="프로젝트 설명"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              취소
            </button>
            <button
              type="button"
              onClick={saveProject}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="mt-3 break-words text-base font-bold text-stone-900 dark:text-stone-50">
            {project.title}
          </h3>
          <p className="mt-2 break-words text-sm leading-6 text-stone-600 dark:text-stone-300">
            {project.description || "설명이 아직 없습니다."}
          </p>
        </>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
            진행률
          </span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {project.progress}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800">
          <div
            className="h-2 rounded-full bg-emerald-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {project.tasks.length === 0 ? (
          <p className="rounded-md bg-stone-50 px-3 py-3 text-sm text-stone-500 dark:bg-stone-950 dark:text-stone-400">
            아직 작업이 없습니다.
          </p>
        ) : (
          project.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 rounded-md bg-stone-50 px-3 py-2 dark:bg-stone-950"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-4 w-4 rounded border-stone-300 accent-emerald-600"
              />
              <span
                className={
                  task.completed
                    ? "min-w-0 flex-1 break-words text-sm text-stone-400 line-through"
                    : "min-w-0 flex-1 break-words text-sm text-stone-700 dark:text-stone-200"
                }
              >
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="rounded-md px-2 py-1 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTask();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-emerald-950"
          placeholder="작업 추가"
        />
        <button
          type="button"
          onClick={addTask}
          className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          disabled={!newTaskTitle.trim()}
        >
          추가
        </button>
      </div>

      <div className="mt-4 border-t border-stone-100 pt-3 dark:border-stone-800">
        <span className="text-xs text-stone-400 dark:text-stone-500">
          최근 수정 {formatDateTime(project.updatedAt)}
        </span>
      </div>
    </article>
  );
}
