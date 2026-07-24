import { eq, inArray, sql } from "drizzle-orm";
import { completeJSON } from "@/lib/ai/client";
import { brainMode } from "@/lib/brain";
import { embedOne } from "@/lib/ai/embeddings";
import { getDb } from "@/lib/db";
import {
  designMemories,
  feedbackEvents,
  insights,
  patterns,
  projects,
} from "@/lib/db/schema";
import { InsightDraftSchema, type LearnInput, type LearnResult } from "@/lib/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const OUTCOME_DELTA: Record<LearnInput["outcome"], number> = {
  accepted: 2,
  converted: 5,
  revision_requested: -2,
  rejected: -5,
};

const DEFAULT_QUALITY_SCORE = 75;

export const INSIGHT_SYSTEM_PROMPT = `You distill design feedback into reusable knowledge for a design agency's shared brain.

Extract only reusable, generalizable design lessons — principles that would improve future projects for other clients. Set worthKeeping=false for project-specific noise: one-off client preferences, logistics, scope changes, or feedback that teaches nothing transferable.

Never name the client, project, brand, company, or domain in the lesson content — generalize to industry and page type (e.g. "a hospitality booking page", not the client's name). The lesson must stand alone with zero project attribution, because it will be shown to agents working for other clients.`;

export const MIN_DISTILL_DETAILS_CHARS = 30;

/**
 * Persist a distilled insight. Shared by the server-brain learn flow and the
 * client-brain save_insight tool. Marks the source feedback event as learned
 * when a feedbackId is provided.
 */
export async function persistInsight(
  draft: { kind: string; content: string; confidence: number },
  evidence: { feedbackId?: string; project?: string; outcome?: string },
): Promise<{ insightId: string }> {
  const db = getDb();
  const embedding = await embedOne(draft.content);
  const [inserted] = await db
    .insert(insights)
    .values({
      kind: draft.kind,
      content: draft.content,
      confidence: clamp(draft.confidence, 0, 1),
      evidence,
      embedding,
    })
    .returning({ id: insights.id });

  if (evidence.feedbackId && UUID_RE.test(evidence.feedbackId)) {
    await db
      .update(feedbackEvents)
      .set({ learned: true })
      .where(eq(feedbackEvents.id, evidence.feedbackId));
  }
  return { insightId: inserted.id };
}

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export async function learn(input: LearnInput): Promise<LearnResult> {
  const db = getDb();

  // Find-or-create the project by case-insensitive name. Insert-first with
  // onConflictDoNothing so concurrent calls racing on projects_name_lower_idx
  // both land on the same row instead of one of them throwing.
  let [project] = await db
    .insert(projects)
    .values({ name: input.project, industry: input.industry ?? null })
    .onConflictDoNothing()
    .returning();
  if (!project) {
    [project] = await db
      .select()
      .from(projects)
      .where(sql`lower(${projects.name}) = lower(${input.project})`)
      .limit(1);
  }
  if (!project) {
    throw new Error(`Failed to find or create project "${input.project}".`);
  }

  const [feedback] = await db
    .insert(feedbackEvents)
    .values({
      projectId: project.id,
      projectName: input.project,
      outcome: input.outcome,
      details: input,
    })
    .returning({ id: feedbackEvents.id });

  const delta = OUTCOME_DELTA[input.outcome];
  const adjustments: string[] = [];

  const slugs = input.patternSlugs ?? [];
  if (slugs.length > 0) {
    // Single SQL-side clamped update: atomic and safe under concurrent learn calls.
    const rows = await db
      .update(patterns)
      .set({
        conversionScore: sql`LEAST(100, GREATEST(0, ${patterns.conversionScore} + ${delta}))`,
        updatedAt: new Date(),
      })
      .where(inArray(patterns.slug, slugs))
      .returning({ slug: patterns.slug, score: patterns.conversionScore });
    for (const row of rows) {
      adjustments.push(
        `pattern "${row.slug}": conversionScore → ${row.score} (${input.outcome} ${signed(delta)})`,
      );
    }
  }

  const memoryIds = (input.memoryIds ?? []).filter((id) => UUID_RE.test(id));
  if (memoryIds.length > 0) {
    const rows = await db
      .update(designMemories)
      .set({
        qualityScore: sql`LEAST(100, GREATEST(0, COALESCE(${designMemories.qualityScore}, ${DEFAULT_QUALITY_SCORE}) + ${delta}))`,
        updatedAt: new Date(),
      })
      .where(inArray(designMemories.id, memoryIds))
      .returning({
        title: designMemories.title,
        score: designMemories.qualityScore,
        confidential: designMemories.confidential,
      });
    for (const row of rows) {
      const label = row.confidential ? "confidential memory" : `memory "${row.title}"`;
      adjustments.push(
        `${label}: qualityScore → ${row.score} (${input.outcome} ${signed(delta)})`,
      );
    }
  }

  // Distill an insight when the feedback carries substantive detail. In client
  // brain mode the connected agent does the distillation instead (the MCP layer
  // returns instructions + the save_insight tool). Soft-fail: a distillation
  // error must not roll back the feedback + adjustments above.
  let insightId: string | null = null;
  const details = input.details?.trim() ?? "";
  if (brainMode() === "server" && details.length > MIN_DISTILL_DETAILS_CHARS) {
    try {
      const draft = await completeJSON({
        system: INSIGHT_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              `Project: ${input.project}`,
              input.industry ? `Industry: ${input.industry}` : null,
              `Outcome: ${input.outcome}`,
              input.componentsChanged?.length
                ? `Components changed: ${input.componentsChanged.join(", ")}`
                : null,
              `Feedback details:\n${details}`,
            ]
              .filter((line): line is string => line !== null)
              .join("\n"),
          },
        ],
        schema: InsightDraftSchema,
      });

      if (draft.worthKeeping) {
        const saved = await persistInsight(draft, {
          feedbackId: feedback.id,
          project: input.project,
          outcome: input.outcome,
        });
        insightId = saved.insightId;
      }
    } catch (err) {
      console.error("Insight distillation failed:", err);
    }
  }

  return { feedbackId: feedback.id, insightId, adjustments };
}
