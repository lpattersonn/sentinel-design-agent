import {
  and,
  cosineDistance,
  desc,
  eq,
  ilike,
  isNotNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { getDb } from "@/lib/db";
import { patterns, type NewPattern, type PatternRow } from "@/lib/db/schema";
import { embedOne } from "@/lib/ai/embeddings";
import { normalizeIndustry } from "@/lib/normalize";

/** Pattern row without its raw embedding vector — safe for API/MCP responses. */
export type PublicPattern = Omit<PatternRow, "embedding">;

function stripEmbedding(row: PatternRow): PublicPattern {
  const { embedding: _omit, ...rest } = row;
  return rest;
}

export async function findPatterns(filters: {
  category?: string;
  industry?: string;
  query?: string;
  limit?: number;
}): Promise<PublicPattern[]> {
  const db = getDb();
  const limit = Math.min(filters.limit ?? 8, 20);

  const conditions: SQL[] = [];
  if (filters.category) {
    conditions.push(eq(patterns.category, filters.category));
  }
  const industry = normalizeIndustry(filters.industry);
  if (industry) {
    // jsonb containment: industries @> '["saas"]'
    conditions.push(
      sql`${patterns.industries} @> ${JSON.stringify([industry])}::jsonb`,
    );
  }

  if (filters.query) {
    const vec = await embedOne(filters.query);
    if (vec) {
      const similarity = sql<number>`1 - (${cosineDistance(patterns.embedding, vec)})`;
      const rows = await db
        .select({ pattern: patterns, similarity })
        .from(patterns)
        .where(and(isNotNull(patterns.embedding), ...conditions))
        .orderBy(desc(similarity))
        .limit(limit);
      return rows.map((r) => stripEmbedding(r.pattern));
    }
    // No embeddings configured — keyword fallback.
    const kw = `%${filters.query}%`;
    const keywordMatch = or(
      ilike(patterns.name, kw),
      ilike(patterns.description, kw),
      ilike(patterns.whyItWorks, kw),
    );
    if (keywordMatch) conditions.push(keywordMatch);
  }

  const rows = await db
    .select()
    .from(patterns)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(patterns.conversionScore))
    .limit(limit);
  return rows.map(stripEmbedding);
}

export async function upsertPattern(
  input: NewPattern,
  opts?: { preserveLearnedScores?: boolean },
): Promise<PublicPattern> {
  // Compute an embedding when the caller has none, so API-created and edited
  // patterns stay reachable from the vector-search branch.
  const embedding =
    input.embedding ??
    (await embedOne(`${input.name}\n${input.description}\n${input.whyItWorks}`));
  const [row] = await getDb()
    .insert(patterns)
    .values({ ...input, embedding })
    .onConflictDoUpdate({
      target: patterns.slug,
      set: {
        name: input.name,
        category: input.category,
        description: input.description,
        whyItWorks: input.whyItWorks,
        strengths: input.strengths ?? [],
        weaknesses: input.weaknesses ?? [],
        idealUseCases: input.idealUseCases ?? [],
        industries: input.industries ?? [],
        complexity: input.complexity ?? 2,
        // preserveLearnedScores: never clobber scores the learning engine adjusted.
        ...(opts?.preserveLearnedScores
          ? {}
          : { conversionScore: input.conversionScore ?? 50 }),
        spec: input.spec ?? null,
        source: input.source ?? null,
        // Keep an existing embedding when we have no new one to offer.
        ...(embedding ? { embedding } : {}),
        updatedAt: new Date(),
      },
    })
    .returning();
  return stripEmbedding(row);
}
