import { describe, expect, test } from "bun:test";
import {
  parseStoredPanelWidths,
  serializePanelWidths,
} from "@/lib/panel-layout";

describe("resizable panel layout storage", () => {
  test("round-trips the persisted panel widths", () => {
    const widths = { leftWidth: 240, middleWidth: 620 };
    expect(parseStoredPanelWidths(serializePanelWidths(widths))).toEqual(widths);
  });

  test("rejects corrupt, outdated, and invalid values", () => {
    expect(parseStoredPanelWidths("not json")).toBeNull();
    expect(
      parseStoredPanelWidths(
        JSON.stringify({ version: 2, leftWidth: 240, middleWidth: 620 }),
      ),
    ).toBeNull();
    expect(
      parseStoredPanelWidths(
        JSON.stringify({ version: 1, leftWidth: -1, middleWidth: 620 }),
      ),
    ).toBeNull();
  });
});
