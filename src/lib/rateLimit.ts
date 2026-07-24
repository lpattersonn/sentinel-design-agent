import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { presentedKey } from "@/lib/auth";
import { getDb, isDbConfigured } from "@/lib/db";
import { rateWindows } from "@/lib/db/schema";

/**
 * Fixed-window rate limiting per API key, backed by Postgres (serverless
 * instances share no memory, so the DB is the only common counter).
 *
 * Purpose: an authorized consumer should be able to USE Sentinel freely but
 * not bulk-export the pattern library and memory that make it valuable.
 * SENTINEL_RATE_LIMIT requests per hour per key (default 400; 0 disables).
 */
const DEFAULT_LIMIT_PER_HOUR = 400;

function limitPerHour(): number {
  const raw = Number(process.env.SENTINEL_RATE_LIMIT);
  if (Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
  return DEFAULT_LIMIT_PER_HOUR;
}

/**
 * Returns a 429 Response when the caller is over budget, else null.
 * Fails open: a rate-limit bookkeeping error must never take Sentinel down.
 */
export async function enforceRateLimit(req: Request): Promise<Response | null> {
  const limit = limitPerHour();
  if (limit === 0 || !isDbConfigured()) return null;

  const key = presentedKey(req);
  if (!key) return null; // no key = dev mode; auth already gated production

  const fingerprint = createHash("sha256").update(key).digest("hex").slice(0, 16);
  const hourWindow = Math.floor(Date.now() / 3_600_000);
  const bucket = `${fingerprint}:${hourWindow}`;

  try {
    const [row] = await getDb()
      .insert(rateWindows)
      .values({ bucket, count: 1 })
      .onConflictDoUpdate({
        target: rateWindows.bucket,
        set: {
          count: sql`${rateWindows.count} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ count: rateWindows.count });

    if (row.count > limit) {
      return Response.json(
        {
          error: `Rate limit exceeded: ${limit} requests per hour per key. The window resets on the hour.`,
        },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }
  } catch (err) {
    console.error("Rate-limit bookkeeping failed (failing open):", err);
  }
  return null;
}
