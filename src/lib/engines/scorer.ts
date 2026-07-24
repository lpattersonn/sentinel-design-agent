import { eq } from "drizzle-orm";
import { completeJSON } from "@/lib/ai/client";
import { getDb, isDbConfigured } from "@/lib/db";
import { designScores, projects } from "@/lib/db/schema";
import { fetchPublic } from "@/lib/safeFetch";
import { ScoreBreakdownSchema, type ScoreResult } from "@/lib/types";

export type ScoreInput = {
  html?: string;
  url?: string;
  description?: string;
  context?: string;
  projectId?: string;
};

const MAX_SOURCE_CHARS = 50_000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SYSTEM = `You are a rigorous principal design reviewer at a world-class product studio. Score the provided design source on eleven dimensions, each 0-100.

Calibration:
- 90+: exceptional, world-class work (rare — reserve for designs that could headline an awards site)
- 75-89: strong professional work
- 60-74: competent, but with real issues holding it back
- below 60: needs rework

Rules:
- Every dimension's reasoning must cite concrete evidence from the provided source — specific elements, structure, copy, class names, measurements. Never score on vibes.
- When the source gives limited signal for a dimension (e.g. animation or performance from static markup), say so explicitly in the reasoning and score conservatively from the evidence available.
- "overall" is a weighted judgment of what matters most for this design's purpose — not an arithmetic average of the dimensions.
- topImprovements must be ordered by impact, most valuable first.`;

function sanitizeSource(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .slice(0, MAX_SOURCE_CHARS);
}

export async function scoreDesign(input: ScoreInput): Promise<ScoreResult> {
  if (!isDbConfigured()) {
    throw new Error(
      "DATABASE_URL is not set — the score would be computed but could not be saved. Configure Supabase first.",
    );
  }
  if (!input.html && !input.url && !input.description) {
    throw new Error("Provide at least one of html, url or description.");
  }

  // Verify the project reference BEFORE the expensive LLM call — an unknown
  // UUID would otherwise fail the insert's FK check after paying for the model.
  let projectId: string | null = null;
  if (input.projectId && UUID_RE.test(input.projectId)) {
    const [existing] = await getDb()
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .limit(1);
    projectId = existing?.id ?? null;
  }

  const parts: string[] = [];
  if (input.context) {
    parts.push(`Context for this review:\n${input.context}`);
  }
  if (input.url) {
    const res = await fetchPublic(input.url, {
      headers: { "User-Agent": "SentinelDesignAgent/1.0" },
    });
    const page = sanitizeSource(await res.text());
    parts.push(
      `Source URL: ${input.url}\n\nFetched page markup (scripts/styles stripped, truncated to ${MAX_SOURCE_CHARS} chars):\n${page}`,
    );
  }
  if (input.html) {
    parts.push(
      `HTML source (scripts/styles stripped, truncated to ${MAX_SOURCE_CHARS} chars):\n${sanitizeSource(input.html)}`,
    );
  }
  if (input.description) {
    parts.push(`Design description:\n${input.description}`);
  }
  parts.push("Score this design across all eleven dimensions.");

  const breakdown = await completeJSON({
    system: SYSTEM,
    messages: [{ role: "user", content: parts.join("\n\n---\n\n") }],
    schema: ScoreBreakdownSchema,
  });

  const target =
    input.url ?? input.description?.slice(0, 120) ?? "inline html";

  const [row] = await getDb()
    .insert(designScores)
    .values({
      projectId,
      target,
      scores: breakdown,
      overall: Math.max(0, Math.min(100, Math.round(breakdown.overall))),
    })
    .returning({ id: designScores.id });

  return { scoreId: row.id, breakdown };
}
