import { Agent } from "@atproto/api";

export interface RepoDescription {
  handle: string;
  did: string;
  collections: string[];
  handleIsCorrect: boolean;
}

export interface RepoRecord {
  uri: string;
  cid: string;
  value: unknown;
}

export interface ListRecordsPage {
  records: RepoRecord[];
  cursor?: string;
}

export async function describeRepo(
  agent: Agent,
  repo: string,
): Promise<RepoDescription> {
  const response = await agent.com.atproto.repo.describeRepo({ repo });
  return {
    handle: response.data.handle,
    did: response.data.did,
    collections: response.data.collections,
    handleIsCorrect: response.data.handleIsCorrect,
  };
}

export async function listRecordsPage(
  agent: Agent,
  repo: string,
  collection: string,
  cursor?: string,
  limit = 100,
): Promise<ListRecordsPage> {
  const response = await agent.com.atproto.repo.listRecords({
    repo,
    collection,
    limit,
    cursor,
  });

  return {
    records: response.data.records.map((record) => ({
      uri: record.uri,
      cid: record.cid,
      value: record.value,
    })),
    cursor: response.data.cursor,
  };
}

export async function listAllRecords(
  agent: Agent,
  repo: string,
  collection: string,
  onPage?: (records: RepoRecord[]) => void,
): Promise<RepoRecord[]> {
  const allRecords: RepoRecord[] = [];
  let cursor: string | undefined;

  do {
    const page = await listRecordsPage(agent, repo, collection, cursor);
    allRecords.push(...page.records);
    onPage?.(page.records);
    cursor = page.cursor;
  } while (cursor);

  return allRecords;
}
