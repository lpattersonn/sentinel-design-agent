import "dotenv/config";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designMemories, insights } from "@/lib/db/schema";
import { embed } from "@/lib/ai/embeddings";
import { upsertPattern } from "@/lib/engines/patterns";
import { normalizeIndustry } from "@/lib/normalize";
import { seedPatterns } from "./patternData";
import { seedInsights, seedMemories } from "./memoryData";

async function seedPatternRows(): Promise<number> {
  const vectors = await embed(
    seedPatterns.map((p) => `${p.name}\n${p.description}\n${p.whyItWorks}`),
  );
  let count = 0;
  for (let i = 0; i < seedPatterns.length; i++) {
    const pattern = seedPatterns[i];
    // preserveLearnedScores: re-seeding must not clobber learning-engine scores.
    await upsertPattern(
      { ...pattern, embedding: vectors?.[i] },
      { preserveLearnedScores: true },
    );
    console.log(`  pattern upserted: ${pattern.slug}`);
    count++;
  }
  return count;
}

async function seedMemoryRows(): Promise<number> {
  const db = getDb();
  const toInsert: typeof seedMemories = [];
  for (const memory of seedMemories) {
    const existing = await db
      .select({ id: designMemories.id })
      .from(designMemories)
      .where(eq(designMemories.title, memory.title))
      .limit(1);
    if (existing.length > 0) {
      console.log(`  memory exists, skipping: ${memory.title}`);
    } else {
      toInsert.push(memory);
    }
  }
  if (toInsert.length === 0) return 0;

  const vectors = await embed(
    toInsert.map((m) => `${m.summary}\n${m.traits.join(", ")}`),
  );
  for (let i = 0; i < toInsert.length; i++) {
    const memory = toInsert[i];
    await db.insert(designMemories).values({
      title: memory.title,
      sourceType: memory.sourceType,
      sourceRef: memory.sourceRef,
      industry: normalizeIndustry(memory.industry),
      brand: memory.brand,
      tags: memory.tags,
      analysis: memory.analysis,
      summary: memory.summary,
      traits: memory.traits,
      qualityScore: memory.qualityScore,
      embedding: vectors?.[i],
    });
    console.log(`  memory inserted: ${memory.title}`);
  }
  return toInsert.length;
}

async function seedInsightRows(): Promise<number> {
  const db = getDb();
  const toInsert: typeof seedInsights = [];
  for (const insight of seedInsights) {
    const existing = await db
      .select({ id: insights.id })
      .from(insights)
      .where(eq(insights.content, insight.content))
      .limit(1);
    if (existing.length > 0) {
      console.log(`  insight exists, skipping: ${insight.content.slice(0, 60)}...`);
    } else {
      toInsert.push(insight);
    }
  }
  if (toInsert.length === 0) return 0;

  const vectors = await embed(toInsert.map((i) => i.content));
  for (let i = 0; i < toInsert.length; i++) {
    const insight = toInsert[i];
    await db.insert(insights).values({
      kind: insight.kind,
      content: insight.content,
      confidence: insight.confidence,
      evidence: { source: "seed:curated" },
      embedding: vectors?.[i],
    });
    console.log(`  insight inserted: ${insight.content.slice(0, 60)}...`);
  }
  return toInsert.length;
}

async function main(): Promise<void> {
  const embeddingsOn = Boolean(process.env.OPENAI_API_KEY);
  console.log(
    `Seeding Sentinel (embeddings ${embeddingsOn ? "enabled" : "disabled — OPENAI_API_KEY unset, keyword search fallback will be used"})`,
  );

  console.log(`Patterns (${seedPatterns.length}):`);
  const patternCount = await seedPatternRows();

  console.log(`Memories (${seedMemories.length}):`);
  const memoryCount = await seedMemoryRows();

  console.log(`Insights (${seedInsights.length}):`);
  const insightCount = await seedInsightRows();

  console.log(
    `Done. ${patternCount} patterns upserted, ${memoryCount} memories inserted, ${insightCount} insights inserted.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
