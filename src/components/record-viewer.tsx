"use client";

import { formatBytes } from "@/lib/format-bytes";
import { stringifyValue } from "@/lib/json";
import type { RepoRecord } from "@/lib/atproto/repo";

interface RecordViewerProps {
  record: RepoRecord | null;
  sizeBytes?: number;
}

export function RecordViewer({ record, sizeBytes }: RecordViewerProps) {
  if (!record) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        Select a record to inspect its JSON value.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
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

      <pre className="w-full max-w-full overflow-x-auto whitespace-pre rounded-xl border border-zinc-800 bg-black/40 p-4 font-mono text-xs leading-6 text-emerald-100">
        {stringifyValue(record.value)}
      </pre>
    </div>
  );
}
