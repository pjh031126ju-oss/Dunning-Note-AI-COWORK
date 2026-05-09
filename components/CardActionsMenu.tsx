"use client";

import { useState } from "react";
import type { MemoCategory } from "@/types";

interface MoveAction {
  category: MemoCategory;
  label: string;
}

interface CardActionsMenuProps {
  label: string;
  moveActions: MoveAction[];
  onMove: (category: MemoCategory) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CardActionsMenu({
  label,
  moveActions,
  onMove,
  onEdit,
  onDelete,
}: CardActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const runAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        <span className="flex flex-col gap-0.5" aria-hidden="true">
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border border-stone-100 bg-white p-1.5 shadow-lg dark:border-stone-700 dark:bg-stone-900">
          {moveActions.length > 0 ? (
            <>
              <p className="px-2 py-1 text-xs font-bold text-stone-400 dark:text-stone-500">
                PARA 이동
              </p>
              {moveActions.map((action) => (
                <button
                  key={action.category}
                  type="button"
                  onClick={() => runAction(() => onMove(action.category))}
                  className="block w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-stone-700 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-stone-200 dark:hover:bg-emerald-950 dark:hover:text-emerald-200"
                >
                  {action.label}
                </button>
              ))}
              <div className="my-1 h-px bg-stone-100 dark:bg-stone-800" />
            </>
          ) : null}

          <button
            type="button"
            onClick={() => runAction(onEdit)}
            className="block w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => runAction(onDelete)}
            className="block w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
