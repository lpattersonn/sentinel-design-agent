import {
  and,
  cosineDistance,
  desc,
  eq,
  ilike,
  isNotNull,
  or,
  sql,
} from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designMemories, insights, type InsightRow } from "@/lib/db/schema";
import { embedOne } from "@/lib/ai/embeddings";
import { toPublicMemory } from "@/lib/engines/memory";
import { normalizeIndustry } from "@/lib/normalize";
import type { SearchHit } from "@/lib/types";

const DEFAULT_LIMIT = 8;
const SNIPPET_LENGTH = 240;
// Keyword scores are normalized into 0..1 then damped so genuine vector
// similarity outranks weak keyword hits when the two result sets merge.
const KEYWORD_SCORE_WEIGHT = 0.5;

function snippet(text: string): string {
  if (text.length <= SNIPPET_LENGTH) return text;
  return `${text.slice(0, SNIPPET_LENGTH - 1).trimEnd()}…`;
}

/**
 * Agent-facing view of an insight: no raw embedding, and no `evidence` — that
 * field carries the client/project name the insight was learned from, which is
 * attribution agents must never see. The lesson content is what travels.
 */
function toPublicInsight(row: InsightRow): Omit<InsightRow, "embedding" | "evidence"> {
  const { embedding: _e, evidence: _v, ...rest } = row;
  return rest;
}

export async function searchMemory(
  query: string,
  opts?: { industry?: string; limit?: number },
): Promise<SearchHit[]> {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, 20);
  const industry = normalizeIndustry(opts?.industry) ?? undefined;
  const vec = await embedOne(query);

  let hits: SearchHit[];
  if (vec) {
    // Hybrid: rows stored with NULL embeddings (analyzer soft-fails embedding)
    // are unreachable by vector search, so always run the keyword pass too and
    // merge, de-duplicated by kind+id keeping the higher score (vector wins ties).
    const [vectorHits, keywordHits] = await Promise.all([
      vectorSearch(vec, industry, limit),
      keywordSearch(query, industry, limit),
    ]);
    const merged = new Map<string, SearchHit>();
    for (const hit of [...vectorHits, ...keywordHits]) {
      const key = `${hit.kind}:${hit.id}`;
      const existing = merged.get(key);
      if (!existing || hit.score > existing.score) merged.set(key, hit);
    }
    hits = [...merged.values()];
  } else {
    hits = await keywordSearch(query, industry, limit);
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function vectorSearch(
  vec: number[],
  industry: string | undefined,
  limit: number,
): Promise<SearchHit[]> {
  const db = getDb();

  const memorySimilarity = sql<number>`1 - (${cosineDistance(designMemories.embedding, vec)})`;
  const insightSimilarity = sql<number>`1 - (${cosineDistance(insights.embedding, vec)})`;

  const [memoryRows, insightRows] = await Promise.all([
    db
      .select({ row: designMemories, similarity: memorySimilarity })
      .from(designMemories)
      .where(
        and(
          isNotNull(designMemories.embedding),
          industry ? eq(designMemories.industry, industry) : undefined,
        ),
      )
      .orderBy(desc(memorySimilarity))
      .limit(limit),
    db
      .select({ row: insights, similarity: insightSimilarity })
      .from(insights)
      .where(isNotNull(insights.embedding))
      .orderBy(desc(insightSimilarity))
      .limit(limit),
  ]);

  return [
    ...memoryRows.map(({ row, similarity }): SearchHit => {
      const pub = toPublicMemory(row);
      return {
        kind: "memory",
        id: row.id,
        title: pub.title,
        snippet: snippet(row.summary),
        score: Number(similarity),
        data: pub,
      };
    }),
    ...insightRows.map(({ row, similarity }): SearchHit => ({
      kind: "insight",
      id: row.id,
      title: `Insight: ${row.kind}`,
      snippet: snippet(row.content),
      score: Number(similarity),
      data: toPublicInsight(row),
    })),
  ];
}

async function keywordSearch(
  query: string,
  industry: string | undefined,
  limit: number,
): Promise<SearchHit[]> {
  const words = query
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length === 0) return [];

  // Escape ILIKE wildcards so query words match literally.
  const patterns = words.map((w) => `%${w.replace(/[\\%_]/g, "\\$&")}%`);
  const db = getDb();

  const [memoryRows, insightRows] = await Promise.all([
    db
      .select()
      .from(designMemories)
      .where(
        and(
          or(
            ...patterns.flatMap((p) => [
              ilike(designMemories.title, p),
              ilike(designMemories.summary, p),
            ]),
          ),
          industry ? eq(designMemories.industry, industry) : undefined,
        ),
      )
      .orderBy(desc(designMemories.createdAt))
      .limit(limit),
    db
      .select()
      .from(insights)
      .where(or(...patterns.map((p) => ilike(insights.content, p))))
      .orderBy(desc(insights.createdAt))
      .limit(limit),
  ]);

  // Normalized 0..1 (matched words / query words), then damped below vector scores.
  const keywordScore = (text: string): number => {
    const haystack = text.toLowerCase();
    const matches = words.filter((w) => haystack.includes(w.toLowerCase())).length;
    return (matches / words.length) * KEYWORD_SCORE_WEIGHT;
  };

  return [
    ...memoryRows.map((row): SearchHit => {
      const pub = toPublicMemory(row);
      return {
        kind: "memory",
        id: row.id,
        title: pub.title,
        snippet: snippet(row.summary),
        score: keywordScore(`${row.title} ${row.summary}`),
        data: pub,
      };
    }),
    ...insightRows.map((row): SearchHit => ({
      kind: "insight",
      id: row.id,
      title: `Insight: ${row.kind}`,
      snippet: snippet(row.content),
      score: keywordScore(row.content),
      data: toPublicInsight(row),
    })),
  ];
}
