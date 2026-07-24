import { lookup } from "node:dns/promises";

const DEFAULT_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 3;

const BLOCKED_HOSTNAME_SUFFIXES = [".localhost", ".local", ".internal"] as const;

/** True when the IPv4 address is loopback, link-local, private, CGNAT or "this network". */
export function isPrivateV4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return true; // unparseable — treat as unsafe
  }
  const [a, b] = parts;
  return (
    a === 0 || // 0.0.0.0/8 "this network"
    a === 10 || // 10/8 private
    a === 127 || // 127/8 loopback
    (a === 100 && b >= 64 && b <= 127) || // 100.64/10 CGNAT
    (a === 169 && b === 254) || // 169.254/16 link-local
    (a === 172 && b >= 16 && b <= 31) || // 172.16/12 private
    (a === 192 && b === 168) // 192.168/16 private
  );
}

/** True when the IPv6 address is loopback, link-local, unique-local, or maps to a private IPv4. */
export function isPrivateV6(ip: string): boolean {
  const lowered = ip.toLowerCase().replace(/%.*$/, ""); // strip zone id
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(lowered);
  if (mapped) return isPrivateV4(mapped[1]);
  if (lowered === "::1" || lowered === "::") return true; // loopback / unspecified
  if (/^fe[89ab]/.test(lowered)) return true; // fe80::/10 link-local
  if (/^f[cd]/.test(lowered)) return true; // fc00::/7 unique-local
  return false;
}

/**
 * Parse and validate a caller-supplied URL for server-side fetching (SSRF guard):
 * http/https only, no internal hostnames, and every resolved address must be public.
 */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: "${raw}".`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      `Unsupported protocol "${url.protocol}" in "${raw}" — only http and https URLs can be fetched.`,
    );
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (
    hostname === "localhost" ||
    BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new Error(`Refusing to fetch internal hostname "${url.hostname}".`);
  }

  // IPv6 literals arrive bracketed from the URL parser.
  const bareHost = hostname.replace(/^\[|\]$/g, "");

  let addresses: { address: string; family: number }[];
  try {
    // dns.lookup resolves IP literals to themselves, so this covers both cases.
    addresses = await lookup(bareHost, { all: true });
  } catch {
    throw new Error(`Could not resolve hostname "${url.hostname}".`);
  }
  if (addresses.length === 0) {
    throw new Error(`Could not resolve hostname "${url.hostname}".`);
  }

  for (const { address, family } of addresses) {
    const isPrivate = family === 4 ? isPrivateV4(address) : isPrivateV6(address);
    if (isPrivate) {
      throw new Error(
        `Refusing to fetch "${url.hostname}" — it resolves to a private or internal address (${address}).`,
      );
    }
  }

  return url;
}

/**
 * Fetch a caller-supplied URL with SSRF protection: validates the URL (and every
 * redirect hop) with assertPublicUrl, bounds the request with a timeout, and
 * throws on a non-ok final response.
 */
export async function fetchPublic(
  raw: string,
  init: { timeoutMs?: number; headers?: Record<string, string> } = {},
): Promise<Response> {
  let url = await assertPublicUrl(raw);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    for (let hop = 0; ; hop++) {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: init.headers,
      });

      if (res.status >= 300 && res.status < 400) {
        void res.body?.cancel().catch(() => undefined);
        const location = res.headers.get("location");
        if (!location) {
          throw new Error(`Redirect from ${url} did not include a Location header.`);
        }
        if (hop >= MAX_REDIRECTS) {
          throw new Error(`Too many redirects fetching ${raw} (max ${MAX_REDIRECTS}).`);
        }
        let next: URL;
        try {
          next = new URL(location, url); // resolve relative Locations against the current URL
        } catch {
          throw new Error(`Redirect from ${url} points to an invalid location "${location}".`);
        }
        url = await assertPublicUrl(next.toString());
        continue;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`);
      }
      return res;
    }
  } finally {
    clearTimeout(timer);
  }
}
