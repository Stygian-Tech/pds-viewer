"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/format-bytes";
import type { RepoRecord } from "@/lib/atproto/repo";
import { parseRecordUri } from "@/lib/atproto/repo";
import { TrashIcon } from "@/components/file-browser-icons";
import { JsonSyntax } from "@/components/json-syntax";

type RecordViewTab = "fields" | "json";

function valueType(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `array · ${value.length}`;
  }
  return typeof value;
}

function recordFields(value: unknown): Array<[string, unknown]> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>);
  }
  return [["value", value]];
}

interface RecordViewerProps {
  record: RepoRecord | null;
  sizeBytes?: number;
  onDelete: (record: RepoRecord) => void;
}

export function RecordViewer({
  record,
  sizeBytes,
  onDelete,
}: RecordViewerProps) {
  const [activeTab, setActiveTab] = useState<RecordViewTab>("fields");

  if (!record) {
    return (
      <div className="px-4 py-8 text-center text-sm text-zinc-500">
        Select a record to inspect its JSON value.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3 p-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
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
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">
              URI
            </p>
            <p className="break-all font-mono text-xs text-zinc-200">
              {record.uri}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">
              CID
            </p>
            <p className="break-all font-mono text-xs text-zinc-200">
              {record.cid}
            </p>
          </div>
          {sizeBytes !== undefined ? (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                Size
              </p>
              <p className="font-mono text-xs text-zinc-200">
                {formatBytes(sizeBytes)}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#101010]">
        <div className="border-b border-zinc-800 bg-[#141414] px-3 pt-2">
          <div role="tablist" aria-label="Record value view" className="flex gap-1">
            <RecordTab
              active={activeTab === "fields"}
              label="Fields"
              onClick={() => setActiveTab("fields")}
            />
            <RecordTab
              active={activeTab === "json"}
              label="Raw JSON"
              onClick={() => setActiveTab("json")}
            />
          </div>
        </div>

        {activeTab === "fields" ? (
          <dl className="divide-y divide-[#2b2b2b]">
            {recordFields(record.value).map(([key, value]) => (
              <div key={key} className="px-4 py-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <dt className="break-all text-xs font-medium text-sky-300">
                    {key}
                  </dt>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                    {valueType(value)}
                  </span>
                </div>
                <dd>
                  <pre className="w-full max-w-full overflow-x-auto whitespace-pre font-mono text-xs leading-6">
                    <JsonSyntax value={value} />
                  </pre>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <pre className="w-full max-w-full overflow-x-auto whitespace-pre p-4 font-mono text-xs leading-6">
            <JsonSyntax value={record.value} />
          </pre>
        )}
      </div>
    </div>
  );
}

function RecordTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`border-b-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
        active
          ? "border-emerald-400 text-zinc-100"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}
