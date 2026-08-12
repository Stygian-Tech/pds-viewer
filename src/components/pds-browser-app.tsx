"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OAuthSession } from "@atproto/oauth-client";
import { Agent } from "@atproto/api";
import {
  createAgent,
  initOAuthSession,
  signInWithHandle,
  signOut,
} from "@/lib/atproto/oauth";
import {
  getRepoBlob,
  listBlobsPage,
  type RepoBlob,
} from "@/lib/atproto/blobs";
import {
  deleteRepoRecord,
  describeRepo,
  listRecordsPage,
  type RepoDescription,
  type RepoRecord,
} from "@/lib/atproto/repo";
import { formatBytes } from "@/lib/format-bytes";
import {
  emptyRepoSizeIndex,
  scanRepoSizes,
  totalRepoBytes,
  type RepoSizeIndex,
  type SizeScanProgress,
} from "@/lib/atproto/repo-sizes";
import { buildFolderTree } from "@/lib/tree";
import { BlobContent, BlobDetails } from "@/components/blob-viewer";
import { BlobList } from "@/components/blob-list";
import { FolderTree } from "@/components/folder-tree";
import {
  LeftColumnTabs,
  type LeftColumnTab,
} from "@/components/left-column-tabs";
import { RecordList } from "@/components/record-list";
import { RecordViewer } from "@/components/record-viewer";
import { DeleteRecordDialog } from "@/components/delete-record-dialog";
import { FolderIcon, RefreshIcon } from "@/components/file-browser-icons";
import { SignInPanel } from "@/components/sign-in-panel";
import {
  BrowserColumn,
  ResizablePanels,
  StackedPanels,
} from "@/components/resizable-panels";

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
  const [recordPendingDeletion, setRecordPendingDeletion] = useState<RepoRecord | null>(null);
  const [recordDeleting, setRecordDeleting] = useState(false);
  const [recordDeleteError, setRecordDeleteError] = useState<string | null>(null);
  const [recordsCursor, setRecordsCursor] = useState<string | undefined>();
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsLoadingMore, setRecordsLoadingMore] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [leftTab, setLeftTab] = useState<LeftColumnTab>("collections");
  const [blobCids, setBlobCids] = useState<string[]>([]);
  const [selectedBlobCid, setSelectedBlobCid] = useState<string | null>(null);
  const [selectedBlob, setSelectedBlob] = useState<RepoBlob | null>(null);
  const [blobsCursor, setBlobsCursor] = useState<string | undefined>();
  const [blobsLoaded, setBlobsLoaded] = useState(false);
  const [blobsLoading, setBlobsLoading] = useState(false);
  const [blobsLoadingMore, setBlobsLoadingMore] = useState(false);
  const [blobsError, setBlobsError] = useState<string | null>(null);
  const [blobLoading, setBlobLoading] = useState(false);
  const [blobError, setBlobError] = useState<string | null>(null);
  const [sizeIndex, setSizeIndex] = useState<RepoSizeIndex>(emptyRepoSizeIndex);
  const [sizeScanProgress, setSizeScanProgress] =
    useState<SizeScanProgress | null>(null);
  const [sizeScanError, setSizeScanError] = useState<string | null>(null);
  const sizeScanAbortRef = useRef<AbortController | null>(null);

  const folderTree = useMemo(
    () => (repo ? buildFolderTree(repo.collections) : null),
    [repo],
  );

  const startSizeScan = useCallback(
    (nextAgent: Agent, did: string, collections: string[]) => {
      sizeScanAbortRef.current?.abort();
      const controller = new AbortController();
      sizeScanAbortRef.current = controller;

      setSizeIndex(emptyRepoSizeIndex());
      setSizeScanProgress({
        phase: "records",
        collectionsDone: 0,
        collectionsTotal: collections.length,
        blobsDone: 0,
        blobsTotal: 0,
      });
      setSizeScanError(null);

      void scanRepoSizes({
        agent: nextAgent,
        did,
        collections,
        signal: controller.signal,
        onProgress: (index, progress) => {
          setSizeIndex({
            ...index,
            recordBytesByUri: { ...index.recordBytesByUri },
            collectionBytes: { ...index.collectionBytes },
            blobBytesByCid: { ...index.blobBytesByCid },
          });
          setSizeScanProgress(progress);
        },
      }).catch((error) => {
        if (controller.signal.aborted) {
          return;
        }
        setSizeScanError(
          error instanceof Error ? error.message : "Failed to scan repo sizes",
        );
        setSizeScanProgress(null);
      });
    },
    [],
  );

  const loadRepo = useCallback(async (nextAgent: Agent, did: string) => {
    setLoadingRepo(true);
    setRepoError(null);

    try {
      const description = await describeRepo(nextAgent, did);
      setRepo(description);
      startSizeScan(nextAgent, did, description.collections);
      setExpandedPaths(new Set());
      setSelectedCollection(null);
      setRecords([]);
      setSelectedRecord(null);
      setRecordsCursor(undefined);
      setBlobCids([]);
      setSelectedBlobCid(null);
      setSelectedBlob(null);
      setBlobsCursor(undefined);
      setBlobsLoaded(false);
      setBlobsError(null);
      setBlobError(null);
    } catch (error) {
      setRepoError(
        error instanceof Error ? error.message : "Failed to describe repository",
      );
    } finally {
      setLoadingRepo(false);
    }
  }, [startSizeScan]);

  useEffect(() => {
    return () => {
      sizeScanAbortRef.current?.abort();
    };
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
        void loadRepo(nextAgent, result.session.did);
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
    setLeftTab("collections");
    setBlobCids([]);
    setSelectedBlobCid(null);
    setSelectedBlob(null);
    sizeScanAbortRef.current?.abort();
    setSizeIndex(emptyRepoSizeIndex());
    setSizeScanProgress(null);
    setSizeScanError(null);
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

  const handleDeleteRecord = async () => {
    if (!agent || !session || !recordPendingDeletion) {
      return;
    }

    setRecordDeleting(true);
    setRecordDeleteError(null);

    try {
      await deleteRepoRecord(agent, session.did, recordPendingDeletion);
      setRecords((current) =>
        current.filter((record) => record.uri !== recordPendingDeletion.uri),
      );
      setSelectedRecord(null);
      setRecordPendingDeletion(null);
      if (repo) {
        startSizeScan(agent, session.did, repo.collections);
      }
    } catch (error) {
      setRecordDeleteError(
        error instanceof Error ? error.message : "Failed to delete record",
      );
    } finally {
      setRecordDeleting(false);
    }
  };

  const loadBlobs = async (cursor?: string, append = false) => {
    if (!agent || !session) {
      return;
    }

    if (append) {
      setBlobsLoadingMore(true);
    } else {
      setBlobsLoading(true);
      setBlobsError(null);
      setSelectedBlobCid(null);
      setSelectedBlob(null);
      setBlobError(null);
    }

    try {
      const page = await listBlobsPage(agent, session.did, cursor);
      setBlobCids((current) =>
        append ? [...current, ...page.cids] : page.cids,
      );
      setBlobsCursor(page.cursor);
      setBlobsLoaded(true);
    } catch (error) {
      setBlobsError(
        error instanceof Error ? error.message : "Failed to load blobs",
      );
    } finally {
      setBlobsLoading(false);
      setBlobsLoadingMore(false);
    }
  };

  const handleSelectBlob = useCallback(
    async (cid: string) => {
      if (!agent || !session) {
        return;
      }

      setSelectedBlobCid(cid);
      setSelectedBlob(null);
      setBlobLoading(true);
      setBlobError(null);

      try {
        const blob = await getRepoBlob(agent, session.did, cid);
        setSelectedBlob(blob);
        setSizeIndex((current) => {
          if (current.blobBytesByCid[cid] === blob.bytes.byteLength) {
            return current;
          }

          const previousBytes = current.blobBytesByCid[cid] ?? 0;
          const delta = blob.bytes.byteLength - previousBytes;
          return {
            ...current,
            blobBytesByCid: {
              ...current.blobBytesByCid,
              [cid]: blob.bytes.byteLength,
            },
            totalBlobBytes: current.totalBlobBytes + delta,
            blobCount:
              previousBytes === 0 ? current.blobCount + 1 : current.blobCount,
          };
        });
      } catch (error) {
        setBlobError(
          error instanceof Error ? error.message : "Failed to load blob",
        );
      } finally {
        setBlobLoading(false);
      }
    },
    [agent, session],
  );

  const prevLeftTabRef = useRef<LeftColumnTab>(leftTab);

  useEffect(() => {
    const returnedToBlobs =
      prevLeftTabRef.current !== "blobs" && leftTab === "blobs";
    prevLeftTabRef.current = leftTab;

    if (!returnedToBlobs || !selectedBlobCid || !agent || !session) {
      return;
    }

    void handleSelectBlob(selectedBlobCid);
  }, [leftTab, selectedBlobCid, agent, session, handleSelectBlob]);

  const handleLeftTabChange = (tab: LeftColumnTab) => {
    setLeftTab(tab);
    if (tab === "blobs" && !blobsLoaded && !blobsLoading) {
      void loadBlobs();
    }
  };

  if (status === "booting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414] text-sm text-zinc-400">
        Restoring OAuth session…
      </div>
    );
  }

  const selectedCollectionBytes =
    selectedCollection !== null
      ? sizeIndex.collectionBytes[selectedCollection]
      : undefined;

  const sizeScanLabel = (() => {
    if (sizeScanError) {
      return sizeScanError;
    }
    if (!sizeScanProgress || sizeScanProgress.phase === "complete") {
      return null;
    }
    if (sizeScanProgress.phase === "records") {
      return `Sizing records ${sizeScanProgress.collectionsDone}/${sizeScanProgress.collectionsTotal}…`;
    }
    return `Sizing blobs ${sizeScanProgress.blobsDone}/${sizeScanProgress.blobsTotal}…`;
  })();

  if (status === "signed-out") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414] px-6 py-12">
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

  const leftPanel = (
    <LeftColumnTabs
      activeTab={leftTab}
      collectionsBadge={repo?.collections.length ?? 0}
      blobsBadge={blobsLoaded ? blobCids.length : undefined}
      onTabChange={handleLeftTabChange}
    >
      {leftTab === "collections" ? (
        folderTree ? (
          <FolderTree
            root={folderTree}
            selectedCollection={selectedCollection}
            expandedPaths={expandedPaths}
            collectionBytes={sizeIndex.collectionBytes}
            onToggle={handleTogglePath}
            onSelectCollection={handleSelectCollection}
          />
        ) : (
          <p className="text-sm text-zinc-500">No collections loaded.</p>
        )
      ) : (
        <BlobList
          cids={blobCids}
          selectedCid={selectedBlobCid}
          blobBytesByCid={sizeIndex.blobBytesByCid}
          loading={blobsLoading}
          loadingMore={blobsLoadingMore}
          hasMore={Boolean(blobsCursor)}
          error={blobsError}
          onSelect={(cid) => {
            void handleSelectBlob(cid);
          }}
          onLoadMore={() => {
            if (blobsCursor) {
              void loadBlobs(blobsCursor, true);
            }
          }}
        />
      )}
    </LeftColumnTabs>
  );

  const middlePanel =
    leftTab === "collections" ? (
      <BrowserColumn
        title="Records"
        subtitle={selectedCollection ?? "Select a collection"}
        badge={
          selectedCollectionBytes !== undefined
            ? formatBytes(selectedCollectionBytes)
            : undefined
        }
      >
        {selectedCollection ? (
          <RecordList
            collection={selectedCollection}
            records={records}
            selectedUri={selectedRecord?.uri ?? null}
            recordBytesByUri={sizeIndex.recordBytesByUri}
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
          <p className="py-8 text-center text-sm text-zinc-500">
            Pick a collection from the tree.
          </p>
        )}
      </BrowserColumn>
    ) : (
      <BrowserColumn
        title="Blob"
        subtitle={selectedBlobCid ?? "Select a blob"}
      >
        <BlobDetails
          blob={selectedBlob}
          loading={blobLoading}
          error={blobError}
        />
      </BrowserColumn>
    );

  const rightPanel =
    leftTab === "collections" ? (
      <BrowserColumn title="Record JSON">
        <RecordViewer
          record={selectedRecord}
          sizeBytes={
            selectedRecord
              ? sizeIndex.recordBytesByUri[selectedRecord.uri]
              : undefined
          }
          onDelete={(record) => {
            setRecordDeleteError(null);
            setRecordPendingDeletion(record);
          }}
        />
      </BrowserColumn>
    ) : (
      <BrowserColumn title="Blob content">
        <BlobContent
          blob={selectedBlob}
          loading={blobLoading}
          error={blobError}
        />
      </BrowserColumn>
    );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#141414] text-zinc-100">
      <header className="flex min-h-14 items-center justify-between gap-4 border-b border-[#2b2b2b] bg-[#141414] px-4 py-2">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex shrink-0 items-center gap-2 border-r border-[#2b2b2b] pr-3 text-zinc-100 sm:pr-4">
            <FolderIcon className="size-5 text-emerald-400" />
            <span className="hidden text-sm font-semibold sm:inline">PDS Viewer</span>
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-xs font-medium">{repo?.handle ?? session?.did}</h1>
              <p className="hidden truncate text-[10px] text-zinc-600 md:block">{session?.did}</p>
            </div>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              Repo size{" "}
              <span className="font-mono text-zinc-300">
                {formatBytes(totalRepoBytes(sizeIndex))}
              </span>
              {sizeIndex.recordCount > 0 || sizeIndex.blobCount > 0 ? (
                <span className="hidden text-zinc-600 sm:inline">
                  {" "}
                  (records {formatBytes(sizeIndex.totalRecordBytes)} · blobs{" "}
                  {formatBytes(sizeIndex.totalBlobBytes)})
                </span>
              ) : null}
              {sizeScanLabel ? (
                <span
                  className={`ml-2 text-[10px] ${
                    sizeScanError ? "text-red-300" : "text-zinc-500"
                  }`}
                >
                  {sizeScanLabel}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={loadingRepo ? "Refreshing repository" : "Refresh repository"}
            onClick={() => {
              if (agent && session) {
                void loadRepo(agent, session.did).then(() => {
                  if (leftTab === "blobs") {
                    void loadBlobs();
                  }
                });
              }
            }}
            disabled={loadingRepo}
            className="flex items-center gap-1.5 rounded-md border border-[#333] px-2.5 py-1.5 text-[10px] text-zinc-400 transition hover:border-zinc-500 hover:bg-[#1b1b1b] hover:text-white disabled:opacity-50"
          >
            <RefreshIcon className="size-3.5" />
            <span className="hidden sm:inline">
              {loadingRepo ? "Refreshing…" : "Refresh repo"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-[#333] px-2.5 py-1.5 text-[10px] text-zinc-400 transition hover:border-zinc-500 hover:bg-[#1b1b1b] hover:text-white"
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

      <ResizablePanels
        left={leftPanel}
        middle={middlePanel}
        right={rightPanel}
      />
      <StackedPanels
        left={leftPanel}
        middle={middlePanel}
        right={rightPanel}
      />
      {recordPendingDeletion ? (
        <DeleteRecordDialog
          record={recordPendingDeletion}
          deleting={recordDeleting}
          error={recordDeleteError}
          onCancel={() => {
            if (!recordDeleting) {
              setRecordDeleteError(null);
              setRecordPendingDeletion(null);
            }
          }}
          onConfirm={() => {
            void handleDeleteRecord();
          }}
        />
      ) : null}
    </div>
  );
}
