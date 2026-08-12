import { describe, expect, test } from "bun:test";
import { buildFolderTree, findFolderNode } from "@/lib/tree";

describe("folder tree navigation", () => {
  const tree = buildFolderTree([
    "app.bsky.feed.post",
    "app.bsky.feed.like",
    "app.bsky.graph.follow",
    "com.example.profile",
  ]);

  test("finds intermediate namespace folders", () => {
    const feed = findFolderNode(tree, "app.bsky.feed");

    expect(feed?.collection).toBeUndefined();
    expect(feed?.children.map((child) => child.name)).toEqual(["like", "post"]);
  });

  test("finds collection nodes and returns null for unknown paths", () => {
    expect(findFolderNode(tree, "app.bsky.feed.post")?.collection).toBe(
      "app.bsky.feed.post",
    );
    expect(findFolderNode(tree, "app.bsky.unknown")).toBeNull();
  });
});
