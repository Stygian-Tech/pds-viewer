import type { Agent } from "@atproto/api";
import { listBlobsPage } from "@/lib/atproto/blobs";
import { listRecordsPage } from "@/lib/atproto/repo";
import { recordSizeBytes } from "@/lib/record-size";

export interface RepoSizeIndex {
  recordBytesByUri: Record<string, number>;
  collectionBytes: Record<string, number>;
  blobBytesByCid: Record<string, number>;
  totalRecordBytes: number;
  totalBlobBytes: number;
  recordCount: number;
  blobCount: number;
}

export type SizeScanPhase = "records" | "blobs" | "complete";

export interface SizeScanProgress {
  phase: SizeScanPhase;
  collectionsDone: number;
  collectionsTotal: number;
  blobsDone: number;
  blobsTotal: number;
}

export function emptyRepoSizeIndex(): RepoSizeIndex {
  return {
    recordBytesByUri: {},
    collectionBytes: {},
    blobBytesByCid: {},
    totalRecordBytes: 0,
    totalBlobBytes: 0,
    recordCount: 0,
    blobCount: 0,
  };
}

export function totalRepoBytes(index: RepoSizeIndex): number {
  return index.totalRecordBytes + index.totalBlobBytes;
}

interface ScanOptions {
  agent: Agent;
  did: string;
  collections: string[];
  signal?: AbortSignal;
  onProgress?: (index: RepoSizeIndex, progress: SizeScanProgress) => void;
  blobConcurrency?: number;
}

export async function scanRepoSizes({
  agent,
  did,
  collections,
  signal,
  onProgress,
  blobConcurrency = 4,
}: ScanOptions): Promise<RepoSizeIndex> {
  const index = emptyRepoSizeIndex();

  const emit = (phase: SizeScanPhase, collectionsDone: number, blobsDone: number, blobsTotal: number) => {
    onProgress?.(index, {
      phase,
      collectionsDone,
      collectionsTotal: collections.length,
      blobsDone,
      blobsTotal,
    });
  };

  emit("records", 0, 0, 0);

  for (let collectionIndex = 0; collectionIndex < collections.length; collectionIndex += 1) {
    if (signal?.aborted) {
      return index;
    }

    const collection = collections[collectionIndex];
    let collectionBytes = 0;
    let cursor: string | undefined;

    do {
      if (signal?.aborted) {
        return index;
      }

      const page = await listRecordsPage(agent, did, collection, cursor);
      for (const record of page.records) {
        const bytes = recordSizeBytes(record.value);
        index.recordBytesByUri[record.uri] = bytes;
        collectionBytes += bytes;
        index.recordCount += 1;
        index.totalRecordBytes += bytes;
      }

      cursor = page.cursor;
    } while (cursor);

    index.collectionBytes[collection] = collectionBytes;
    emit("records", collectionIndex + 1, 0, 0);
  }

  const blobCids: string[] = [];
  let blobsCursor: string | undefined;

  do {
    if (signal?.aborted) {
      return index;
    }

    const page = await listBlobsPage(agent, did, blobsCursor);
    blobCids.push(...page.cids);
    blobsCursor = page.cursor;
  } while (blobsCursor);

  emit("blobs", collections.length, 0, blobCids.length);

  for (let offset = 0; offset < blobCids.length; offset += blobConcurrency) {
    if (signal?.aborted) {
      return index;
    }

    const batch = blobCids.slice(offset, offset + blobConcurrency);
    const sizes = await Promise.all(
      batch.map(async (cid) => {
        const response = await agent.com.atproto.sync.getBlob({ did, cid });
        return { cid, bytes: response.data.byteLength };
      }),
    );

    for (const { cid, bytes } of sizes) {
      index.blobBytesByCid[cid] = bytes;
      index.blobCount += 1;
      index.totalBlobBytes += bytes;
    }

    emit("blobs", collections.length, offset + batch.length, blobCids.length);
  }

  if (!signal?.aborted) {
    emit("complete", collections.length, blobCids.length, blobCids.length);
  }

  return index;
}
