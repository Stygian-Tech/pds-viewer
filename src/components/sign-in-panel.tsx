"use client";

interface SignInPanelProps {
  handle: string;
  loading: boolean;
  error: string | null;
  onHandleChange: (value: string) => void;
  onSignIn: () => void;
}

export function SignInPanel({
  handle,
  loading,
  error,
  onHandleChange,
  onSignIn,
}: SignInPanelProps) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl shadow-black/40">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          AT Protocol
        </p>
        <h1 className="text-3xl font-semibold text-zinc-50">PDS Viewer</h1>
        <p className="text-sm leading-6 text-zinc-400">
          Sign in with your handle to browse every collection in your personal
          data server like a file tree. Pure curiosity, read-only.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSignIn();
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-300">Handle</span>
          <input
            type="text"
            value={handle}
            onChange={(event) => onHandleChange(event.target.value)}
            placeholder="you.bsky.social"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            autoComplete="username"
            disabled={loading}
          />
        </label>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || handle.trim().length === 0}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Connecting…" : "Sign in with OAuth"}
        </button>
      </form>

      <p className="text-xs leading-5 text-zinc-500">
        OAuth runs entirely in your browser. Handle resolution uses the public
        Bluesky resolver for convenience during local development.
      </p>
    </section>
  );
}
