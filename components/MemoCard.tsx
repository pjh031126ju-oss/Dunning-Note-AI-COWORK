"use client";

import { useState } from "react";
import { CardActionsMenu } from "@/components/CardActionsMenu";
import { formatDateTime } from "@/lib/date";
import {
  CATEGORY_BUTTON_LABELS,
  CATEGORY_KO_LABELS,
  CATEGORY_ORDER,
} from "@/lib/para";
import { createSummary, createTitle } from "@/lib/storage";
import type { Memo, MemoCategory } from "@/types";

type MemoUpdate = Partial<Pick<Memo, "rawText" | "title" | "summary" | "tags">>;

interface MemoCardProps {
  memo: Memo;
  compact?: boolean;
  hideInboxMove?: boolean;
  showDecisionHelper?: boolean;
  onMove: (memoId: string, category: MemoCategory) => void;
  onUpdate: (memoId: string, updates: MemoUpdate) => void;
  onDelete: (memoId: string) => void;
}

export function MemoCard({
  memo,
  compact = false,
  hideInboxMove = false,
  showDecisionHelper = false,
  onMove,
  onUpdate,
  onDelete,
}: MemoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rawText, setRawText] = useState(memo.rawText);
  const [title, setTitle] = useState(memo.title);
  const [summary, setSummary] = useState(memo.summary);
  const [tagInput, setTagInput] = useState(memo.tags?.join(", ") ?? "");
  const moveCategories = CATEGORY_ORDER.filter(
    (category) =>
      category !== memo.category && !(hideInboxMove && category === "INBOX"),
  );
  const moveActions = moveCategories.map((category) => ({
    category,
    label: CATEGORY_BUTTON_LABELS[category],
  }));

  const saveChanges = () => {
    const tags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onUpdate(memo.id, {
      rawText: rawText.trim(),
      title: title.trim() || createTitle(rawText),
      summary: summary.trim() || createSummary(rawText),
      tags,
    });
    setIsEditing(false);
  };

  const resetChanges = () => {
    setRawText(memo.rawText);
    setTitle(memo.title);
    setSummary(memo.summary);
    setTagInput(memo.tags?.join(", ") ?? "");
    setIsEditing(false);
  };

  return (
    <article className="rounded-lg border border-stone-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-stone-700 dark:bg-stone-900">
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">
            {formatDateTime(memo.updatedAt)}
          </span>
          {!isEditing ? (
            <CardActionsMenu
              label="메모 작업 메뉴"
              moveActions={moveActions}
              onMove={(category) => onMove(memo.id, category)}
              onEdit={() => setIsEditing(true)}
              onDelete={() => onDelete(memo.id)}
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
            placeholder="제목"
          />
          <textarea
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            rows={compact ? 3 : 5}
            className="w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-emerald-950"
            placeholder="메모 내용"
          />
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={2}
            className="w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-emerald-950"
            placeholder="요약"
          />
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-emerald-950"
            placeholder="태그를 쉼표로 구분"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={resetChanges}
              className="rounded-md border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              취소
            </button>
            <button
              type="button"
              onClick={saveChanges}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="mt-3 break-words text-base font-bold text-stone-900 dark:text-stone-50">
            {memo.title}
          </h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-600 dark:text-stone-300">
            {compact ? memo.summary : memo.rawText}
          </p>
          {memo.tags && memo.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {memo.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          {memo.attachments && memo.attachments.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {memo.attachments.map((attachment) => (
                <span
                  key={attachment.id}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400"
                >
                  {attachment.name} · {formatAttachmentSize(attachment.size)}
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}

      {showDecisionHelper && memo.category === "INBOX" && !isEditing ? (
        <ParaDecisionHelper onMove={(category) => onMove(memo.id, category)} />
      ) : null}
    </article>
  );
}

function formatAttachmentSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function ParaDecisionHelper({
  onMove,
}: {
  onMove: (category: MemoCategory) => void;
}) {
  const [step, setStep] = useState(0);
  const [keptInInbox, setKeptInInbox] = useState(false);
  const questions: Array<{ question: string; yesCategory: MemoCategory }> = [
    {
      question: "이 메모가 지금 진행 중인 Project에 필요한가?",
      yesCategory: "PROJECT",
    },
    {
      question: "계속 관리해야 하는 영역인가?",
      yesCategory: "AREA",
    },
    {
      question: "나중에 참고할 만한 주제나 자료인가?",
      yesCategory: "RESOURCE",
    },
    {
      question: "지금은 필요 없거나 끝난 건가?",
      yesCategory: "ARCHIVE",
    },
  ];

  const currentQuestion = questions[step];

  if (keptInInbox) {
    return (
      <div className="mt-4 rounded-md bg-stone-50 p-3 text-sm text-stone-600 dark:bg-stone-950 dark:text-stone-300">
        아직 애매하면 Inbox에 남겨두고 다음 리뷰 때 다시 판단하세요.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950">
      <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
        PARA 분류 도우미
      </p>
      <p className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-100">
        {currentQuestion.question}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onMove(currentQuestion.yesCategory)}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          Yes → {CATEGORY_KO_LABELS[currentQuestion.yesCategory]}
        </button>
        <button
          type="button"
          onClick={() => {
            if (step === questions.length - 1) {
              setKeptInInbox(true);
              return;
            }
            setStep((current) => current + 1);
          }}
          className="rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-200 dark:hover:bg-stone-800"
        >
          No → 다음 질문
        </button>
      </div>
    </div>
  );
}
