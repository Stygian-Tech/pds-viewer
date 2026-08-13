import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TopLevelNamespaces } from "@/components/top-level-namespaces";
import { buildFolderTree } from "@/lib/tree";

describe("top-level namespace navigation", () => {
  test("renders TLDs without rendering descendant namespaces", () => {
    const root = buildFolderTree([
      "app.bsky.feed.post",
      "com.example.profile",
    ]);
    const markup = renderToStaticMarkup(
      <TopLevelNamespaces
        root={root}
        selectedPath="app.bsky"
        collectionBytes={{}}
        onSelectNode={() => {}}
      />,
    );

    expect(markup).toContain(">app<");
    expect(markup).toContain(">com<");
    expect(markup).not.toContain(">bsky<");
    expect(markup).not.toContain(">example<");
  });
});
