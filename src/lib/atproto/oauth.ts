import { Agent } from "@atproto/api";
import {
  BrowserOAuthClient,
  buildLoopbackClientId,
} from "@atproto/oauth-client-browser";
import type { OAuthSession } from "@atproto/oauth-client";

const HANDLE_RESOLVER = "https://bsky.social";

let oauthClient: BrowserOAuthClient | null = null;

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function buildClientId(): string {
  if (typeof window === "undefined") {
    return "https://example.com/oauth-client-metadata.json";
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

export async function initOAuthSession(): Promise<{
  session: OAuthSession;
  state?: string | null;
} | null> {
  const client = await getOAuthClient();
  const result = await client.init();

  if (!result) {
    return null;
  }

  if ("state" in result) {
    return { session: result.session, state: result.state };
  }

  return { session: result.session };
}

export async function signInWithHandle(handle: string): Promise<never> {
  const client = await getOAuthClient();
  return client.signInRedirect(handle.trim());
}

export async function signOut(did: string): Promise<void> {
  const client = await getOAuthClient();
  await client.revoke(did);
}

export function createAgent(session: OAuthSession): Agent {
  return new Agent(session);
}
