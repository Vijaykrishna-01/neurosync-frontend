"use client";

import { AlertTriangle } from "lucide-react";
import type { Menu } from "@/types/menu";

interface DeleteConfirmModalProps {
  menu: Menu | null;
  childCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  menu,
  childCount,
  onCancel,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!menu) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Delete &quot;{menu.name}&quot;?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              This will permanently remove this menu item.
              {childCount > 0 && (
                <span className="mt-1 block font-medium text-rose-600">
                  It has {childCount} child menu{childCount > 1 ? "s" : ""}{" "}
                  that will become orphaned or must be removed first,
                  depending on your API&apos;s rules.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete menu"}
          </button>
        </div>
      </div>
    </div>
  );
}
