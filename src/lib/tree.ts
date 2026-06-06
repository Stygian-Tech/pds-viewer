export interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
  collection?: string;
}

function insertCollection(root: FolderNode, collection: string): void {
  const segments = collection.split(".");
  let current = root;
  let path = "";

  segments.forEach((segment, index) => {
    path = path ? `${path}.${segment}` : segment;
    const isLeaf = index === segments.length - 1;

    let child = current.children.find((node) => node.name === segment);
    if (!child) {
      child = {
        name: segment,
        path,
        children: [],
        collection: isLeaf ? collection : undefined,
      };
      current.children.push(child);
    } else if (isLeaf) {
      child.collection = collection;
    }

    current = child;
  });
}

export function buildFolderTree(collections: string[]): FolderNode {
  const root: FolderNode = {
    name: "repo",
    path: "",
    children: [],
  };

  const sorted = [...collections].sort((a, b) => a.localeCompare(b));
  for (const collection of sorted) {
    insertCollection(root, collection);
  }

  sortTree(root);
  return root;
}

function sortTree(node: FolderNode): void {
  node.children.sort((a, b) => a.name.localeCompare(b.name));
  for (const child of node.children) {
    sortTree(child);
  }
}

export function flattenCollections(node: FolderNode): string[] {
  const collections: string[] = [];
  if (node.collection) {
    collections.push(node.collection);
  }
  for (const child of node.children) {
    collections.push(...flattenCollections(child));
  }
  return collections;
}
