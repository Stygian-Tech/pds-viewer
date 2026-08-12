"use client";

import { FolderIcon } from "@/components/file-browser-icons";
import { formatBytes } from "@/lib/format-bytes";
import type { FolderNode } from "@/lib/tree";
import { subtreeCollectionBytes } from "@/lib/tree-sizes";

interface NamespaceContentsProps {
  node: FolderNode;
  collectionBytes: Record<string, number>;
  onSelectNode: (node: FolderNode) => void;
}

export function NamespaceContents({
  node,
  collectionBytes,
  onSelectNode,
}: NamespaceContentsProps) {
  if (node.children.length === 0) {
    return null;
  }

  return (
    <div className={node.collection ? "border-b border-[#2b2b2b]" : ""}>
      <div className="grid grid-cols-[minmax(180px,1fr)_100px_80px] gap-3 border-b border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-zinc-600">
        <span>Name</span>
        <span>Kind</span>
        <span className="text-right">Size</span>
      </div>
      {node.children.map((child) => {
        const sizeBytes = subtreeCollectionBytes(child, collectionBytes);
        const kind = child.collection ? "Collection" : "Folder";

        return (
          <button
            key={child.path}
            type="button"
            onClick={() => onSelectNode(child)}
            className="grid w-full grid-cols-[minmax(180px,1fr)_100px_80px] items-center gap-3 border-b border-zinc-800/80 px-3 py-2 text-left text-xs text-zinc-300 transition last:border-b-0 hover:bg-zinc-900/80"
          >
            <span className="flex min-w-0 items-center gap-2">
              <FolderIcon className="size-4 shrink-0 text-emerald-400/80" />
              <span className="truncate">{child.name}</span>
            </span>
            <span className="text-[11px] text-zinc-500">{kind}</span>
            <span className="text-right text-[11px] text-zinc-500">
              {sizeBytes > 0 || child.collection
                ? formatBytes(sizeBytes)
                : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
