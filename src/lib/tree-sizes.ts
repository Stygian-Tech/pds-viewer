import type { FolderNode } from "@/lib/tree";

export function subtreeCollectionBytes(
  node: FolderNode,
  collectionBytes: Record<string, number>,
): number {
  let total = 0;

  if (node.collection) {
    total += collectionBytes[node.collection] ?? 0;
  }

  for (const child of node.children) {
    total += subtreeCollectionBytes(child, collectionBytes);
  }

  return total;
}
