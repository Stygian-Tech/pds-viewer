"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OAuthSession } from "@atproto/oauth-client";
import { Agent } from "@atproto/api";
import {
  createAgent,
  initOAuthSession,
  signInWithHandle,
  signOut,
} from "@/lib/atproto/oauth";
import {
  describeRepo,
  listRecordsPage,
  type RepoDescription,
  type RepoRecord,
} from "@/lib/atproto/repo";
import { buildFolderTree } from "@/lib/tree";
import { FolderTree } from "@/components/folder-tree";
import { RecordList } from "@/components/record-list";
import { RecordViewer } from "@/components/record-viewer";
import { SignInPanel } from "@/components/sign-in-panel";

type AppStatus = "booting" | "signed-out" | "signed-in";

export function PdsBrowserApp() {
  const [status, setStatus] = useState<AppStatus>("booting");
  const [session, setSession] = useState<OAuthSession | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [repo, setRepo] = useState<RepoDescription | null>(null);
  const [handleInput, setHandleInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [records, setRecords] = useState<RepoRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RepoRecord | null>(null);
  const [recordsCursor, setRecordsCursor] = useState<string | undefined>();
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsLoadingMore, setRecordsLoadingMore] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const folderTree = useMemo(
    () => (repo ? buildFolderTree(repo.collections) : null),
    [repo],
  );

  const loadRepo = useCallback(async (nextAgent: Agent, did: string) => {
    setLoadingRepo(true);
    setRepoError(null);

    try {
      const description = await describeRepo(nextAgent, did);
      setRepo(description);
      setExpandedPaths(new Set());
      setSelectedCollection(null);
      setRecords([]);
      setSelectedRecord(null);
      setRecordsCursor(undefined);
    } catch (error) {
      setRepoError(
        error instanceof Error ? error.message : "Failed to describe repository",
      );
    } finally {
      setLoadingRepo(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const result = await initOAuthSession();
        if (cancelled) {
          return;
        }

        if (!result) {
          setStatus("signed-out");
          return;
        }

        const nextAgent = createAgent(result.session);
        setSession(result.session);
        setAgent(nextAgent);
        setStatus("signed-in");
        await loadRepo(nextAgent, result.session.did);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setAuthError(
          error instanceof Error ? error.message : "Failed to initialize OAuth",
        );
        setStatus("signed-out");
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [loadRepo]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setAuthError(null);

    try {
      await signInWithHandle(handleInput);
    } catch (error) {
      setSigningIn(false);
      setAuthError(
        error instanceof Error ? error.message : "Failed to start OAuth flow",
      );
    }
  };

  const handleSignOut = async () => {
    if (!session) {
      return;
    }

    try {
      await signOut(session.did);
    } catch {
      // Clearing local state is enough for a curiosity tool.
    }

    setSession(null);
    setAgent(null);
    setRepo(null);
    setSelectedCollection(null);
    setRecords([]);
    setSelectedRecord(null);
    setStatus("signed-out");
  };

  const handleTogglePath = (path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandPathForCollection = (collection: string) => {
    const segments = collection.split(".");
    const paths: string[] = [];
    let path = "";

    for (let index = 0; index < segments.length - 1; index += 1) {
      path = path ? `${path}.${segments[index]}` : segments[index];
      paths.push(path);
    }

    setExpandedPaths((current) => {
      const next = new Set(current);
      for (const item of paths) {
        next.add(item);
      }
      return next;
    });
  };

  const loadCollectionRecords = async (
    collection: string,
    cursor?: string,
    append = false,
  ) => {
    if (!agent || !session) {
      return;
    }

    if (append) {
      setRecordsLoadingMore(true);
    } else {
      setRecordsLoading(true);
      setRecordsError(null);
      setSelectedRecord(null);
    }

    try {
      const page = await listRecordsPage(agent, session.did, collection, cursor);
      setRecords((current) =>
        append ? [...current, ...page.records] : page.records,
      );
      setRecordsCursor(page.cursor);
    } catch (error) {
      setRecordsError(
        error instanceof Error ? error.message : "Failed to load records",
      );
    } finally {
      setRecordsLoading(false);
      setRecordsLoadingMore(false);
    }
  };

  const handleSelectCollection = async (collection: string) => {
    setSelectedCollection(collection);
    expandPathForCollection(collection);
    await loadCollectionRecords(collection);
  };

  if (status === "booting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
        Restoring OAuth session…
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#14532d33,_transparent_55%),_linear-gradient(180deg,_#09090b,_#020617)] px-6 py-12">
        <SignInPanel
          handle={handleInput}
          loading={signingIn}
          error={authError}
          onHandleChange={setHandleInput}
          onSignIn={handleSignIn}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            PDS Viewer
          </p>
          <h1 className="text-lg font-semibold">
            {repo?.handle ?? session?.did}
          </h1>
          <p className="font-mono text-xs text-zinc-500">{session?.did}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (agent && session) {
                void loadRepo(agent, session.did);
              }
            }}
            disabled={loadingRepo}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
          >
            {loadingRepo ? "Refreshing…" : "Refresh repo"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-red-500/50 hover:text-red-200"
          >
            Sign out
          </button>
        </div>
      </header>

      {repoError ? (
        <div className="border-b border-red-500/30 bg-red-500/10 px-6 py-3 text-sm text-red-300">
          {repoError}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.2fr)]">
        <aside className="border-b border-zinc-800 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Collections</h2>
            <span className="text-xs text-zinc-500">
              {repo?.collections.length ?? 0}
            </span>
          </div>
          {folderTree ? (
            <FolderTree
              root={folderTree}
              selectedCollection={selectedCollection}
              expandedPaths={expandedPaths}
              onToggle={handleTogglePath}
              onSelectCollection={handleSelectCollection}
            />
          ) : (
            <p className="text-sm text-zinc-500">No collections loaded.</p>
          )}
        </aside>

        <section className="border-b border-zinc-800 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-zinc-300">Records</h2>
            <p className="font-mono text-xs text-zinc-500">
              {selectedCollection ?? "Select a collection"}
            </p>
          </div>
          {selectedCollection ? (
            <RecordList
              collection={selectedCollection}
              records={records}
              selectedUri={selectedRecord?.uri ?? null}
              loading={recordsLoading}
              loadingMore={recordsLoadingMore}
              hasMore={Boolean(recordsCursor)}
              error={recordsError}
              onSelect={setSelectedRecord}
              onLoadMore={() => {
                if (selectedCollection && recordsCursor) {
                  void loadCollectionRecords(
                    selectedCollection,
                    recordsCursor,
                    true,
                  );
                }
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Pick a collection from the tree.
            </div>
          )}
        </section>

        <section className="p-4">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-zinc-300">Record JSON</h2>
          </div>
          <RecordViewer record={selectedRecord} />
        </section>
      </div>
    </div>
  );
}
