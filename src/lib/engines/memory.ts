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

function stripEmbedding(row: DesignMemoryRow): PublicDesignMemory {
  const { embedding: _omit, ...rest } = row;
  return rest;
}

export async function saveMemory(row: NewDesignMemory): Promise<PublicDesignMemory> {
  const [saved] = await getDb().insert(designMemories).values(row).returning();
  return stripEmbedding(saved);
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
    .limit(filters.limit ?? 20);
  return rows.map(stripEmbedding);
}

export async function getMemory(id: string): Promise<PublicDesignMemory | null> {
  // Reject malformed ids up front — Postgres errors on invalid uuid casts.
  if (!UUID_RE.test(id)) return null;
  const [row] = await getDb()
    .select()
    .from(designMemories)
    .where(eq(designMemories.id, id))
    .limit(1);
  return row ? stripEmbedding(row) : null;
}
