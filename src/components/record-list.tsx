"use client";

import { recordLabel } from "@/lib/json";
import type { RepoRecord } from "@/lib/atproto/repo";

interface RecordListProps {
  collection: string;
  records: RepoRecord[];
  selectedUri: string | null;
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
    <div className="space-y-3">
      <div className="space-y-1">
        {records.map((record) => {
          const selected = record.uri === selectedUri;
          return (
            <button
              key={record.uri}
              type="button"
              onClick={() => onSelect(record)}
              className={`flex w-full flex-col gap-1 rounded-xl border px-3 py-2 text-left transition ${
                selected
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              <span className="truncate text-sm text-zinc-100">
                {recordLabel(record.value, record.uri)}
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
          className="w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
        >
          {loadingMore ? "Loading more…" : "Load more records"}
        </button>
      ) : null}
    </div>
  );
}
