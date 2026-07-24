import { NextResponse, type NextRequest } from "next/server";

/**
 * Optional HTTP Basic auth for the dashboard.
 * Active only when SENTINEL_DASHBOARD_PASSWORD is set; username is "sentinel".
 * The API surface (/api/* and the /mcp alias) is excluded by the matcher —
 * it carries its own bearer-token auth.
 */
export function middleware(req: NextRequest) {
  const password = process.env.SENTINEL_DASHBOARD_PASSWORD;
  if (!password) return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      // atob yields Latin-1; browsers send UTF-8 — decode the raw bytes.
      const bytes = Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      const separator = decoded.indexOf(":");
      const user = decoded.slice(0, separator);
      const pass = decoded.slice(separator + 1);
      if (separator !== -1 && user === "sentinel" && pass === password) {
        return NextResponse.next();
      }
    } catch {
      // Malformed base64 — fall through to the challenge.
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Sentinel", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!api|mcp|_next/static|_next/image|favicon.ico).*)"],
};
