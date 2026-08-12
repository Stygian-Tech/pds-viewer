"use client";

import { formatBytes } from "@/lib/format-bytes";
import { stringifyValue } from "@/lib/json";
import type { RepoRecord } from "@/lib/atproto/repo";
import { parseRecordUri } from "@/lib/atproto/repo";
import { TrashIcon } from "@/components/file-browser-icons";

interface RecordViewerProps {
  record: RepoRecord | null;
  sizeBytes?: number;
  onDelete: (record: RepoRecord) => void;
}

export function RecordViewer({ record, sizeBytes, onDelete }: RecordViewerProps) {
  if (!record) {
    return (
      <div className="px-4 py-8 text-center text-sm text-zinc-500">
        Select a record to inspect its JSON value.
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="border-b border-zinc-800 px-4 py-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Record key</p>
            <p className="mt-1 truncate text-xs text-zinc-200">{parseRecordUri(record.uri).rkey}</p>
          </div>
          <button
            type="button"
            onClick={() => onDelete(record)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-red-500/30 px-2.5 py-1.5 text-[10px] text-red-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-200"
          >
            <TrashIcon className="size-3.5" />
            Delete
          </button>
        </div>
        <div className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">URI</p>
          <p className="break-all font-mono text-xs text-zinc-200">{record.uri}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">CID</p>
          <p className="break-all font-mono text-xs text-zinc-200">{record.cid}</p>
        </div>
        {sizeBytes !== undefined ? (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">Size</p>
            <p className="font-mono text-xs text-zinc-200">{formatBytes(sizeBytes)}</p>
          </div>
        ) : null}
        </div>
      </div>

      <div className="border-b border-zinc-800 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">JSON</div>
      <pre className="w-full max-w-full overflow-x-auto whitespace-pre bg-[#101010] p-4 font-mono text-xs leading-6 text-emerald-100">
        {stringifyValue(record.value)}
      </pre>
    </div>
  );
}
