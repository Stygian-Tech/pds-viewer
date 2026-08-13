"use client";

import { FolderIcon } from "@/components/file-browser-icons";
import { formatBytes } from "@/lib/format-bytes";
import type { FolderNode } from "@/lib/tree";
import { subtreeCollectionBytes } from "@/lib/tree-sizes";

interface TopLevelNamespacesProps {
  root: FolderNode;
  selectedPath: string;
  collectionBytes: Record<string, number>;
  onSelectNode: (node: FolderNode) => void;
}

export function TopLevelNamespaces({
  root,
  selectedPath,
  collectionBytes,
  onSelectNode,
}: TopLevelNamespacesProps) {
  return (
    <div className="space-y-0.5 py-1">
      {root.children.map((node) => {
        const selected =
          selectedPath === node.path || selectedPath.startsWith(`${node.path}.`);
        const sizeBytes = subtreeCollectionBytes(node, collectionBytes);

        return (
          <button
            key={node.path}
            type="button"
            onClick={() => onSelectNode(node)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[10px] transition ${
              selected
                ? "bg-emerald-500/15 text-emerald-100"
                : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
            }`}
          >
            <FolderIcon
              className={`size-3.5 shrink-0 ${
                selected ? "text-emerald-400" : "text-zinc-500"
              }`}
            />
            <span className="truncate font-mono">{node.name}</span>
            <span className="ml-auto shrink-0 font-mono text-[9px] text-zinc-600">
              {formatBytes(sizeBytes)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
