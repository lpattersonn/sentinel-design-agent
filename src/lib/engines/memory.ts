import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  designMemories,
  type DesignMemoryRow,
  type NewDesignMemory,
} from "@/lib/db/schema";
import { normalizeIndustry } from "@/lib/normalize";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Memory row without its raw embedding vector — safe for API/MCP responses. */
export type PublicDesignMemory = Omit<DesignMemoryRow, "embedding">;

/**
 * Agent-facing view of a memory row: the embedding is dropped, and for
 * confidential client work the identity fields (title, brand, sourceRef) are
 * redacted so consuming agents get the design intelligence without ever
 * learning which client/project it came from. The dashboard reads the DB
 * directly and keeps full attribution.
 */
export function toPublicMemory(row: DesignMemoryRow): PublicDesignMemory {
  const { embedding: _omit, ...rest } = row;
  if (!rest.confidential) return rest;
  const style = (rest.analysis as { style?: string } | null)?.style ?? "Design study";
  return {
    ...rest,
    title: `${style} — confidential client work${rest.industry ? ` (${rest.industry})` : ""}`,
    brand: null,
    sourceRef: null,
  };
}

export async function saveMemory(row: NewDesignMemory): Promise<PublicDesignMemory> {
  const [saved] = await getDb().insert(designMemories).values(row).returning();
  return toPublicMemory(saved);
}

export async function listMemories(filters: {
  industry?: string;
  limit?: number;
}): Promise<PublicDesignMemory[]> {
  const industry = normalizeIndustry(filters.industry);
  const rows = await getDb()
    .select()
    .from(designMemories)
    .where(industry ? eq(designMemories.industry, industry) : undefined)
    .orderBy(desc(designMemories.createdAt))
    .limit(Math.min(filters.limit ?? 20, 20));
  return rows.map(toPublicMemory);
}

export async function getMemory(id: string): Promise<PublicDesignMemory | null> {
  // Reject malformed ids up front — Postgres errors on invalid uuid casts.
  if (!UUID_RE.test(id)) return null;
  const [row] = await getDb()
    .select()
    .from(designMemories)
    .where(eq(designMemories.id, id))
    .limit(1);
  return row ? toPublicMemory(row) : null;
}
