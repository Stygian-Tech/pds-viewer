# PDS Viewer

A read-only, client-side Next.js app for browsing your AT Protocol PDS like a file tree.

Sign in with OAuth, discover every collection in your repo via `com.atproto.repo.describeRepo`, then inspect records with paginated `com.atproto.repo.listRecords` calls. Collection NSIDs are rendered as nested folders, so `link.latr.saved.item.external` appears as:

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

All OAuth session handling and repo reads happen in the browser.

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

## OAuth metadata

Local development uses the ATProto loopback client ID helper from `@atproto/oauth-client-browser`.

For deployment, update [`public/oauth-client-metadata.json`](public/oauth-client-metadata.json) so these values match your hosted origin:

- `client_id`
- `client_uri`
- `redirect_uris`

The metadata file must be reachable at:

```text
https://your-domain.example/oauth-client-metadata.json
```

## Scripts

```bash
bun run dev      # next dev --turbopack
bun run lint
bun run build    # next build --turbopack
bun run start
```

## Limitations

- Scope is the signed-in account's repo only.
- Read-only: no record writes or deletes.
- Handle resolution currently uses `https://bsky.social` for convenience.
- Large collections load in pages of 100 records with a manual "Load more" action.
