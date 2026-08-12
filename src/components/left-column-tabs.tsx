"use client";

import type { ReactNode } from "react";

export type LeftColumnTab = "collections" | "blobs";

interface LeftColumnTabsProps {
  activeTab: LeftColumnTab;
  collectionsBadge?: number;
  blobsBadge?: number;
  onTabChange: (tab: LeftColumnTab) => void;
  children: ReactNode;
}

export function LeftColumnTabs({
  activeTab,
  collectionsBadge,
  blobsBadge,
  onTabChange,
  children,
}: LeftColumnTabsProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="shrink-0 border-b border-zinc-800/80 px-4 py-3">
        <div
          role="tablist"
          aria-label="Repository browser"
          className="flex gap-0.5 rounded-md border border-[#303030] bg-[#101010] p-0.5"
        >
          <TabButton
            active={activeTab === "collections"}
            label="Collections"
            badge={collectionsBadge}
            onClick={() => onTabChange("collections")}
          />
          <TabButton
            active={activeTab === "blobs"}
            label="Blobs"
            badge={blobsBadge}
            onClick={() => onTabChange("blobs")}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {children}
      </div>
    </div>
  );
}

function TabButton({
  active,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-0.5 text-[9px] leading-tight transition ${
        active
          ? "bg-emerald-500/15 text-emerald-200"
          : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined ? (
        <span className="text-[9px] text-zinc-500">{badge}</span>
      ) : null}
    </button>
  );
}
