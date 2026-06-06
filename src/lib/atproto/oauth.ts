import { Agent } from "@atproto/api";
import {
  BrowserOAuthClient,
  buildLoopbackClientId,
} from "@atproto/oauth-client-browser";
import type { OAuthSession } from "@atproto/oauth-client";

const HANDLE_RESOLVER = "https://bsky.social";
const PRODUCTION_ORIGIN = "https://pdsviewer.dev";
const INIT_TIMEOUT_MS = 15_000;

let oauthClient: BrowserOAuthClient | null = null;
let initPromise: Promise<{
  session: OAuthSession;
  state?: string | null;
} | null> | null = null;

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function buildClientId(): string {
  if (typeof window === "undefined") {
    return `${PRODUCTION_ORIGIN}/oauth-client-metadata.json`;
  }

  if (isLoopbackHost(window.location.hostname)) {
    return buildLoopbackClientId(window.location);
  }

  return `${window.location.origin}/oauth-client-metadata.json`;
}

export async function getOAuthClient(): Promise<BrowserOAuthClient> {
  if (oauthClient) {
    return oauthClient;
  }

  oauthClient = await BrowserOAuthClient.load({
    clientId: buildClientId(),
    handleResolver: HANDLE_RESOLVER,
  });

  return oauthClient;
}

export function resetOAuthInit(): void {
  initPromise = null;
}

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(message));
    }, INIT_TIMEOUT_MS);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function doInitOAuthSession(): Promise<{
  session: OAuthSession;
  state?: string | null;
} | null> {
  const client = await getOAuthClient();
  const params = client.readCallbackParams();

  if (params) {
    const redirectUri = client.findRedirectUrl();
    if (!redirectUri) {
      throw new Error(
        "OAuth callback detected on the wrong origin. Open the app at http://127.0.0.1:3000 instead of localhost.",
      );
    }

    const result = await client.initCallback(params, redirectUri);
    return {
      session: result.session,
      state: "state" in result ? result.state : undefined,
    };
  }

  try {
    const restored = await client.initRestore();
    if (!restored) {
      return null;
    }
    return { session: restored.session };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Redirecting to loopback IP..."
    ) {
      return await new Promise(() => {
        // The browser is navigating to 127.0.0.1 for loopback OAuth.
      });
    }
    throw error;
  }
}

export async function initOAuthSession(): Promise<{
  session: OAuthSession;
  state?: string | null;
} | null> {
  if (!initPromise) {
    initPromise = withTimeout(
      doInitOAuthSession(),
      "OAuth session restore timed out. Try signing in again.",
    ).catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

export async function signInWithHandle(handle: string): Promise<never> {
  const client = await getOAuthClient();
  return client.signInRedirect(handle.trim());
}

export async function signOut(did: string): Promise<void> {
  const client = await getOAuthClient();
  await client.revoke(did);
  resetOAuthInit();
}

export function createAgent(session: OAuthSession): Agent {
  return new Agent(session);
}
