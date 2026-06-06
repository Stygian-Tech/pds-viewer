"use client";

import { formatBytes } from "@/lib/format-bytes";

interface BlobListProps {
  cids: string[];
  selectedCid: string | null;
  blobBytesByCid: Record<string, number>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onSelect: (cid: string) => void;
  onLoadMore: () => void;
}

export function BlobList({
  cids,
  selectedCid,
  blobBytesByCid,
  loading,
  loadingMore,
  hasMore,
  error,
  onSelect,
  onLoadMore,
}: BlobListProps) {
  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        Loading blobs…
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

  if (cids.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        No blobs in this repository.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        {cids.map((cid) => {
          const selected = cid === selectedCid;
          return (
            <button
              key={cid}
              type="button"
              onClick={() => onSelect(cid)}
              className={`flex w-full flex-col gap-0.5 rounded-lg border px-2.5 py-1.5 text-left transition ${
                selected
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[11px] text-zinc-200">
                  {cid}
                </span>
                {blobBytesByCid[cid] !== undefined ? (
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                    {formatBytes(blobBytesByCid[cid])}
                  </span>
                ) : null}
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
          className="w-full rounded-lg border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
        >
          {loadingMore ? "Loading more…" : "Load more blobs"}
        </button>
      ) : null}
    </div>
  );
}
