import { describe, expect, test } from "bun:test";
import type { Agent } from "@atproto/api";
import { deleteRepoRecord, parseRecordUri } from "@/lib/atproto/repo";
import { canConfirmRecordDeletion } from "@/components/delete-record-dialog";

describe("record mutations", () => {
  test("requires acknowledgement and an exact record-key match", () => {
    expect(canConfirmRecordDeletion(false, "3abc123", "3abc123")).toBe(false);
    expect(canConfirmRecordDeletion(true, "3ABC123", "3abc123")).toBe(false);
    expect(canConfirmRecordDeletion(true, "3abc123", "3abc123")).toBe(true);
  });

  test("parses a collection and record key from an AT URI", () => {
    expect(
      parseRecordUri("at://did:plc:example/app.bsky.feed.post/3abc123"),
    ).toEqual({
      collection: "app.bsky.feed.post",
      rkey: "3abc123",
    });
  });

  test("rejects malformed record URIs", () => {
    expect(() => parseRecordUri("https://example.com/record")).toThrow(
      "invalid AT URI",
    );
  });

  test("deletes with the selected CID as a compare-and-swap guard", async () => {
    let input: unknown;
    const agent = {
      com: {
        atproto: {
          repo: {
            deleteRecord: async (nextInput: unknown) => {
              input = nextInput;
            },
          },
        },
      },
    } as unknown as Agent;

    await deleteRepoRecord(agent, "did:plc:example", {
      uri: "at://did:plc:example/app.bsky.feed.post/3abc123",
      cid: "bafyrecordcid",
      value: { text: "hello" },
    });

    expect(input).toEqual({
      repo: "did:plc:example",
      collection: "app.bsky.feed.post",
      rkey: "3abc123",
      swapRecord: "bafyrecordcid",
    });
  });
});
