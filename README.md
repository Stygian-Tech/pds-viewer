# PDS Viewer

A client-side Next.js app for browsing and carefully managing your AT Protocol PDS like a file tree.

Sign in with OAuth, discover every collection in your repo via `com.atproto.repo.describeRepo`, then inspect records with paginated `com.atproto.repo.listRecords` calls. Selected records can be deleted through a two-step confirmation flow backed by `com.atproto.repo.deleteRecord`. Collection NSIDs are rendered as nested folders, so `link.latr.saved.item.external` appears as:

```text
link
└── latr
    └── saved
        └── item
            └── external
```

## Stack

- Next.js App Router with Turbopack
- Bun
- `@atproto/oauth-client-browser`
- `@atproto/api`

All OAuth session handling and repo operations happen in the browser.

## Local development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

The dev server binds to `http://127.0.0.1:3000` because ATProto loopback OAuth requires the IP address, not `localhost`.

1. Enter your ATProto handle.
2. Complete the OAuth redirect.
3. Browse collections in the left tree.
4. Select a collection to load records.
5. Click a record to inspect its JSON.
6. If necessary, delete a selected record after acknowledging the risk and typing its exact record key.

## OAuth metadata

Local development uses the ATProto loopback client ID helper from `@atproto/oauth-client-browser`.

Production is hosted on Railway at [pdsviewer.dev](https://pdsviewer.dev). OAuth client metadata lives at:

```text
https://pdsviewer.dev/oauth-client-metadata.json
```

## Scripts

```bash
bun run dev      # next dev --turbopack
bun run lint
bun run test
bun run build    # next build --turbopack
bun run start
```

## Limitations

- Scope is the signed-in account's repo only.
- Read-only: no record writes or deletes.
- Handle resolution currently uses `https://bsky.social` for convenience.
- Large collections load in pages of 100 records with a manual "Load more" action.
