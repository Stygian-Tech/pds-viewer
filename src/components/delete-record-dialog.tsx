"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RepoRecord } from "@/lib/atproto/repo";
import { parseRecordUri } from "@/lib/atproto/repo";
import { TrashIcon, WarningIcon } from "@/components/file-browser-icons";

interface DeleteRecordDialogProps {
  record: RepoRecord;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function canConfirmRecordDeletion(
  acknowledged: boolean,
  confirmation: string,
  rkey: string,
): boolean {
  return acknowledged && confirmation === rkey;
}

export function DeleteRecordDialog({
  record,
  deleting,
  error,
  onCancel,
  onConfirm,
}: DeleteRecordDialogProps) {
  const { collection, rkey } = useMemo(
    () => parseRecordUri(record.uri),
    [record.uri],
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [deleting, onCancel]);

  const canDelete =
    canConfirmRecordDeletion(acknowledged, confirmation, rkey) && !deleting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-record-title"
        aria-describedby="delete-record-warning"
        tabIndex={-1}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-[#3a3a3a] bg-[#181818] shadow-2xl shadow-black/60 outline-none"
      >
        <div className="flex items-center justify-between border-b border-zinc-700/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <TrashIcon className="size-4" />
            </span>
            <div>
              <h2 id="delete-record-title" className="text-sm font-semibold text-zinc-100">
                {step === 1 ? "Delete this record?" : "Delete this record permanently?"}
              </h2>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Step {step} of 2
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            aria-label="Close delete dialog"
            className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <dl className="grid grid-cols-[92px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-zinc-500">Collection</dt>
            <dd className="truncate text-zinc-200">{collection}</dd>
            <dt className="text-zinc-500">Record key</dt>
            <dd className="truncate text-zinc-200">{rkey}</dd>
          </dl>

          <div id="delete-record-warning" className="flex gap-3 rounded-lg border border-red-500/50 bg-red-500/8 p-4 text-xs leading-5 text-red-200">
            <WarningIcon className="mt-0.5 size-5 shrink-0 text-red-400" />
            <p>
              Deleting records outside their owning app can break app state,
              references, feeds, or sync. Only continue if you understand the
              consequences. This action cannot be undone in PDS Viewer.
            </p>
          </div>

          {step === 1 ? (
            <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-zinc-300">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-0.5 size-4 accent-emerald-500"
                autoFocus
              />
              <span>I understand this may break apps that use this record.</span>
            </label>
          ) : (
            <label className="block space-y-2">
              <span className="block text-xs leading-5 text-zinc-300">
                To confirm, type the exact record key <strong className="font-medium text-zinc-100">{rkey}</strong> below.
              </span>
              <input
                type="text"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={deleting}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="block text-[11px] text-zinc-500">The record key is case-sensitive.</span>
            </label>
          )}

          {error ? (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-700/70 bg-zinc-900/40 px-5 py-4">
          <button type="button" onClick={onCancel} disabled={deleting} className="rounded-lg border border-zinc-600 px-4 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50">
            Cancel
          </button>
          {step === 1 ? (
            <button type="button" onClick={() => setStep(2)} disabled={!acknowledged} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">
              Continue
            </button>
          ) : (
            <button type="button" onClick={onConfirm} disabled={!canDelete} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">
              {deleting ? "Deleting…" : "Delete permanently"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
