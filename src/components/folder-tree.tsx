"use client";

import type { FolderNode } from "@/lib/tree";

interface FolderTreeProps {
  root: FolderNode;
  selectedCollection: string | null;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelectCollection: (collection: string) => void;
}

function TreeNode({
  node,
  depth,
  selectedCollection,
  expandedPaths,
  onToggle,
  onSelectCollection,
}: {
  node: FolderNode;
  depth: number;
  selectedCollection: string | null;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelectCollection: (collection: string) => void;
}) {
  const isLeaf = Boolean(node.collection);
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = node.collection === selectedCollection;
  const hasChildren = node.children.length > 0;

  if (node.path === "") {
    return (
      <>
        {node.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={0}
            selectedCollection={selectedCollection}
            expandedPaths={expandedPaths}
            onToggle={onToggle}
            onSelectCollection={onSelectCollection}
          />
        ))}
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isLeaf && node.collection) {
            onSelectCollection(node.collection);
            return;
          }
          if (hasChildren) {
            onToggle(node.path);
          }
        }}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
          isSelected
            ? "bg-emerald-500/15 text-emerald-200"
            : "text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="w-4 shrink-0 text-xs text-zinc-500">
          {hasChildren ? (isExpanded ? "▾" : "▸") : isLeaf ? "◦" : ""}
        </span>
        <span className="font-mono text-[13px]">{node.name}</span>
        {isLeaf ? (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-zinc-500">
            collection
          </span>
        ) : null}
      </button>

      {hasChildren && isExpanded ? (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedCollection={selectedCollection}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onSelectCollection={onSelectCollection}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function FolderTree({
  root,
  selectedCollection,
  expandedPaths,
  onToggle,
  onSelectCollection,
}: FolderTreeProps) {
  return (
    <div className="space-y-1 overflow-auto">
      <TreeNode
        node={root}
        depth={0}
        selectedCollection={selectedCollection}
        expandedPaths={expandedPaths}
        onToggle={onToggle}
        onSelectCollection={onSelectCollection}
      />
    </div>
  );
}
