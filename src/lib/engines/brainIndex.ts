import { count, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  designMemories,
  designScores,
  feedbackEvents,
  insights,
  patterns,
} from "@/lib/db/schema";
import { toPublicMemory } from "@/lib/engines/memory";

/**
 * The organized map of Sentinel's brain — lets agents see what exists before
 * querying, so retrieval is one precise hop instead of blind guessing.
 * Confidential memories appear with redacted titles only.
 */
export async function getBrainIndex() {
  const db = getDb();

  const [patternRows, memoryRows, insightKinds, [scoreCount], [feedbackCount]] =
    await Promise.all([
      db
        .select({
          slug: patterns.slug,
          category: patterns.category,
          conversionScore: patterns.conversionScore,
          industries: patterns.industries,
        })
        .from(patterns)
        .orderBy(patterns.category, desc(patterns.conversionScore)),
      db.select().from(designMemories).orderBy(desc(designMemories.createdAt)).limit(100),
      db
        .select({ kind: insights.kind, total: count() })
        .from(insights)
        .groupBy(insights.kind)
        .orderBy(sql`count(*) DESC`),
      db.select({ total: count() }).from(designScores),
      db.select({ total: count() }).from(feedbackEvents),
    ]);

  const patternsByCategory: Record<string, { slug: string; conversionScore: number }[]> = {};
  const industries = new Set<string>();
  for (const p of patternRows) {
    (patternsByCategory[p.category] ??= []).push({
      slug: p.slug,
      conversionScore: p.conversionScore,
    });
    for (const industry of p.industries) industries.add(industry);
  }

  const referenceMemories: { title: string; industry: string | null }[] = [];
  const confidentialByIndustry: Record<string, number> = {};
  for (const row of memoryRows) {
    if (row.confidential) {
      const key = row.industry ?? "unspecified";
      confidentialByIndustry[key] = (confidentialByIndustry[key] ?? 0) + 1;
    } else {
      const pub = toPublicMemory(row);
      referenceMemories.push({ title: pub.title, industry: pub.industry });
    }
  }

  return {
    patterns: {
      total: patternRows.length,
      byCategory: patternsByCategory,
      industries: [...industries].sort(),
    },
    memories: {
      total: memoryRows.length,
      reference: referenceMemories,
      confidentialClientWork: confidentialByIndustry,
    },
    insights: {
      total: insightKinds.reduce((sum, k) => sum + Number(k.total), 0),
      byKind: Object.fromEntries(insightKinds.map((k) => [k.kind, Number(k.total)])),
    },
    activity: {
      scoresRecorded: Number(scoreCount.total),
      feedbackEvents: Number(feedbackCount.total),
    },
    howToQuery: [
      "find_patterns { category, industry?, query? } — categories above; results ranked by conversionScore.",
      "search_memory { query, kind?: 'memory'|'insight', industry? } — free-text over analyses and principles; use kind to target.",
      "Memory titles listed above can be fetched in full via search_memory with distinctive title words.",
    ],
  };
}
