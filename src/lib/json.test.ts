import { describe, expect, test } from "bun:test";
import { tokenizeJson } from "@/lib/json";

describe("JSON syntax highlighting", () => {
  test("classifies keys and JSON primitive values", () => {
    const tokens = tokenizeJson(
      '{"text":"hello","count":42,"active":true,"missing":null}',
    );

    expect(tokens.filter((token) => token.type === "key").map((token) => token.value)).toEqual([
      '"text"',
      '"count"',
      '"active"',
      '"missing"',
    ]);
    expect(tokens).toContainEqual({ type: "string", value: '"hello"' });
    expect(tokens).toContainEqual({ type: "number", value: "42" });
    expect(tokens).toContainEqual({ type: "boolean", value: "true" });
    expect(tokens).toContainEqual({ type: "null", value: "null" });
  });

  test("preserves punctuation and whitespace", () => {
    const json = '{\n  "nested": [1, 2]\n}';
    expect(tokenizeJson(json).map((token) => token.value).join("")).toBe(json);
  });
});
