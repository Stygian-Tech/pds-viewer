"use client";

import { formatBytes } from "@/lib/format-bytes";
import type { FolderNode } from "@/lib/tree";
import { subtreeCollectionBytes } from "@/lib/tree-sizes";

interface FolderTreeProps {
  root: FolderNode;
  selectedCollection: string | null;
  expandedPaths: Set<string>;
  collectionBytes: Record<string, number>;
  onToggle: (path: string) => void;
  onSelectCollection: (collection: string) => void;
}

function TreeNode({
  node,
  depth,
  selectedCollection,
  expandedPaths,
  collectionBytes,
  onToggle,
  onSelectCollection,
}: {
  node: FolderNode;
  depth: number;
  selectedCollection: string | null;
  expandedPaths: Set<string>;
  collectionBytes: Record<string, number>;
  onToggle: (path: string) => void;
  onSelectCollection: (collection: string) => void;
}) {
  const isLeaf = Boolean(node.collection);
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = node.collection === selectedCollection;
  const hasChildren = node.children.length > 0;
  const sizeBytes = subtreeCollectionBytes(node, collectionBytes);
  const sizeLabel =
    sizeBytes > 0 || node.collection
      ? formatBytes(sizeBytes)
      : null;

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
            collectionBytes={collectionBytes}
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
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
          isSelected
            ? "bg-emerald-500/15 text-emerald-200"
            : "text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
        }`}
        style={{ paddingLeft: `${depth * 16 + 10}px` }}
      >
        <span className="w-4 shrink-0 text-xs text-zinc-500">
          {hasChildren ? (isExpanded ? "▾" : "▸") : isLeaf ? "◦" : ""}
        </span>
        <span className="truncate font-mono text-xs">{node.name}</span>
        {sizeLabel ? (
          <span className="ml-auto shrink-0 font-mono text-[10px] text-zinc-500">
            {sizeLabel}
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
              collectionBytes={collectionBytes}
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
  collectionBytes,
  onToggle,
  onSelectCollection,
}: FolderTreeProps) {
  return (
    <div className="space-y-1 py-1">
      <TreeNode
        node={root}
        depth={0}
        selectedCollection={selectedCollection}
        expandedPaths={expandedPaths}
        collectionBytes={collectionBytes}
        onToggle={onToggle}
        onSelectCollection={onSelectCollection}
      />
    </div>
  );
}
