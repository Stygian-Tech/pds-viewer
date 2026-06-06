"use client";

import { formatBytes } from "@/lib/format-bytes";
import { recordLabel } from "@/lib/json";
import type { RepoRecord } from "@/lib/atproto/repo";

interface RecordListProps {
  collection: string;
  records: RepoRecord[];
  selectedUri: string | null;
  recordBytesByUri: Record<string, number>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onSelect: (record: RepoRecord) => void;
  onLoadMore: () => void;
}

export function RecordList({
  collection,
  records,
  selectedUri,
  recordBytesByUri,
  loading,
  loadingMore,
  hasMore,
  error,
  onSelect,
  onLoadMore,
}: RecordListProps) {
  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        Loading records…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        No records in <span className="font-mono text-zinc-300">{collection}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        {records.map((record) => {
          const selected = record.uri === selectedUri;
          return (
            <button
              key={record.uri}
              type="button"
              onClick={() => onSelect(record)}
              className={`flex w-full flex-col gap-0.5 rounded-lg border px-2 py-1 text-left transition ${
                selected
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-zinc-100">
                  {recordLabel(record.value, record.uri)}
                </span>
                {recordBytesByUri[record.uri] !== undefined ? (
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                    {formatBytes(recordBytesByUri[record.uri])}
                  </span>
                ) : null}
              </span>
              <span className="truncate font-mono text-[11px] text-zinc-500">
                {record.uri}
              </span>
            </button>
          );
        })}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="w-full rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
        >
          {loadingMore ? "Loading more…" : "Load more records"}
        </button>
      ) : null}
    </div>
  );
}
