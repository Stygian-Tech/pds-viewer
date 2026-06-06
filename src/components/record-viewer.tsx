"use client";

import { stringifyValue } from "@/lib/json";
import type { RepoRecord } from "@/lib/atproto/repo";

interface RecordViewerProps {
  record: RepoRecord | null;
}

export function RecordViewer({ record }: RecordViewerProps) {
  if (!record) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Select a record to inspect its JSON value.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">URI</p>
          <p className="break-all font-mono text-xs text-zinc-200">{record.uri}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">CID</p>
          <p className="break-all font-mono text-xs text-zinc-200">{record.cid}</p>
        </div>
      </div>

      <pre className="min-h-0 flex-1 overflow-auto rounded-xl border border-zinc-800 bg-black/40 p-4 font-mono text-xs leading-6 text-emerald-100">
        {stringifyValue(record.value)}
      </pre>
    </div>
  );
}
