"use client";

import { formatBytes } from "@/lib/format-bytes";
import { recordLabel } from "@/lib/json";
import type { RepoRecord } from "@/lib/atproto/repo";
import { parseRecordUri } from "@/lib/atproto/repo";
import { RecordIcon } from "@/components/file-browser-icons";

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
      <div className="px-4 py-8 text-center text-sm text-zinc-500">
        Loading records…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-zinc-500">
        No records in <span className="font-mono text-zinc-300">{collection}</span>
      </div>
    );
  }

  return (
    <div className="min-w-[520px]">
      <div className="grid grid-cols-[minmax(190px,1fr)_minmax(140px,.8fr)_80px] gap-3 border-b border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-zinc-600">
        <span>Name</span>
        <span>Record key</span>
        <span className="text-right">Size</span>
      </div>
      <div>
        {records.map((record) => {
          const selected = record.uri === selectedUri;
          const { rkey } = parseRecordUri(record.uri);
          return (
            <button
              key={record.uri}
              type="button"
              onClick={() => onSelect(record)}
              className={`grid w-full grid-cols-[minmax(190px,1fr)_minmax(140px,.8fr)_80px] items-center gap-3 border-b border-zinc-800/80 px-3 py-1.5 text-left text-[10px] transition ${
                selected
                  ? "bg-emerald-500/14 text-emerald-50"
                  : "text-zinc-300 hover:bg-zinc-900/80"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <RecordIcon className={`size-3.5 shrink-0 ${selected ? "text-emerald-400" : "text-zinc-500"}`} />
                <span className="truncate">
                  {recordLabel(record.value, record.uri)}
                </span>
              </span>
              <span className="truncate text-[9px] text-zinc-500">
                {rkey}
              </span>
              <span className="text-right text-[9px] text-zinc-500">
                {recordBytesByUri[record.uri] !== undefined
                  ? formatBytes(recordBytesByUri[record.uri])
                  : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {hasMore ? (
        <div className="p-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full rounded-lg border border-zinc-700 px-2 py-1.5 text-[10px] text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
          >
            {loadingMore ? "Loading more…" : "Load more records"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
