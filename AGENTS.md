<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Default new apps to the usual Next.js stack (App Router, TypeScript, Tailwind).
- Use Bun as the package manager and run Next.js dev/build with Turbopack.
- Use system monospace (`ui-monospace` stack) for the whole app; never declare SF Mono or SFMono-Regular in the font stack (license restriction).
- Host GitHub repos under the Stygian-Tech organization.
- When implementing from an attached plan, do not edit the plan file itself.
- JSON/debug `<pre>` blocks should not wrap long lines; use horizontal overflow scrolling.

## Learned Workspace Facts

- `pds-viewer` is a read-only, client-side Next.js app that OAuth-authenticates and browses the signed-in account's ATProto repo as an NSID folder tree.
- Production is at https://pdsviewer.dev; OAuth client metadata lives at `/oauth-client-metadata.json` on that origin.
- GitHub repo: https://github.com/Stygian-Tech/pds-viewer.
- Repo scope is the signed-in account only (via `describeRepo` + `listRecords`); not every repo on the PDS host.
- Local dev must use `http://127.0.0.1:3000` (not `localhost`) for ATProto loopback OAuth; dev server binds to `127.0.0.1`.
- Stack: Next.js 16 App Router, `@atproto/oauth-client-browser`, `@atproto/api`, Tailwind CSS 4.
- Handle resolution uses `https://bsky.social`.
