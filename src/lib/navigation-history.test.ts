import { describe, expect, test } from "bun:test";
import { pushNavigationPath } from "@/lib/navigation-history";

describe("NSID navigation history", () => {
  test("adds a newly selected folder", () => {
    expect(pushNavigationPath({ paths: [""], index: 0 }, "app")).toEqual({
      paths: ["", "app"],
      index: 1,
    });
  });

  test("replaces forward history after navigating back", () => {
    expect(
      pushNavigationPath(
        { paths: ["", "app", "app.bsky"], index: 1 },
        "com",
      ),
    ).toEqual({ paths: ["", "app", "com"], index: 2 });
  });

  test("does not duplicate the current folder", () => {
    const history = { paths: ["", "app"], index: 1 };
    expect(pushNavigationPath(history, "app")).toBe(history);
  });
});
