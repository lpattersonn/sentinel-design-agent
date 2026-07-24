/**
 * Shared-secret auth for the MCP server and REST API.
 * Clients send `Authorization: Bearer <key>` (or `x-api-key`).
 *
 * Keys come from SENTINEL_API_KEY (single) and/or SENTINEL_API_KEYS
 * (comma-separated, for handing each consumer their own revocable key —
 * remove one from the list to cut off that consumer without rotating the rest).
 *
 * When no key is configured, requests are allowed only outside production
 * (next dev); a production deploy without keys rejects everything with 401.
 */
function configuredKeys(): string[] {
  const keys = [
    process.env.SENTINEL_API_KEY ?? "",
    ...(process.env.SENTINEL_API_KEYS ?? "").split(","),
  ]
    .map((k) => k.trim())
    .filter(Boolean);
  return [...new Set(keys)];
}

/** The credential the caller presented, regardless of validity. */
export function presentedKey(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return req.headers.get("x-api-key");
}

export function isAuthorized(req: Request): boolean {
  const keys = configuredKeys();
  if (keys.length === 0) return process.env.NODE_ENV !== "production";
  const presented = presentedKey(req);
  return presented !== null && keys.includes(presented);
}

export function unauthorized(): Response {
  return Response.json(
    { error: "Unauthorized. Send Authorization: Bearer <SENTINEL_API_KEY>." },
    { status: 401 },
  );
}
