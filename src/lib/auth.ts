/**
 * Shared-secret auth for the MCP server and REST API.
 * Clients send `Authorization: Bearer <SENTINEL_API_KEY>` (or `x-api-key`).
 * When SENTINEL_API_KEY is unset, requests are allowed only outside production
 * (next dev); a production deploy without the key rejects everything with 401.
 */
export function isAuthorized(req: Request): boolean {
  const key = process.env.SENTINEL_API_KEY;
  if (!key) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  return bearer === key || req.headers.get("x-api-key") === key;
}

export function unauthorized(): Response {
  return Response.json(
    { error: "Unauthorized. Send Authorization: Bearer <SENTINEL_API_KEY>." },
    { status: 401 },
  );
}
