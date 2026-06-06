import { Agent } from "@atproto/api";

export interface ListBlobsPage {
  cids: string[];
  cursor?: string;
}

export interface RepoBlob {
  cid: string;
  bytes: Uint8Array;
  contentType: string;
}

export async function listBlobsPage(
  agent: Agent,
  did: string,
  cursor?: string,
  limit = 100,
): Promise<ListBlobsPage> {
  const response = await agent.com.atproto.sync.listBlobs({
    did,
    limit,
    cursor,
  });

  return {
    cids: response.data.cids,
    cursor: response.data.cursor,
  };
}

export async function getRepoBlob(
  agent: Agent,
  did: string,
  cid: string,
): Promise<RepoBlob> {
  const response = await agent.com.atproto.sync.getBlob({ did, cid });
  const rawContentType = response.headers["content-type"];
  const contentType =
    rawContentType?.split(";")[0]?.trim() ?? "application/octet-stream";

  return {
    cid,
    bytes: response.data,
    contentType,
  };
}
