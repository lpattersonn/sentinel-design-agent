import { completeJSON } from "@/lib/ai/client";
import type { PublicPattern } from "@/lib/engines/patterns";
import { findPatterns } from "@/lib/engines/patterns";
import { searchMemory } from "@/lib/engines/retrieval";
import {
  BestPracticeBundleSchema,
  type BestPracticeBundle,
  type SearchHit,
} from "@/lib/types";

/**
 * Map a free-form pageType onto the pattern categories worth retrieving.
 * Hero + CTA are always relevant; the rest depend on what the page is.
 */
export function relevantCategories(pageType: string): string[] {
  const t = pageType.toLowerCase();
  const cats = new Set<string>(["hero", "cta"]);
  const add = (...cs: string[]) => cs.forEach((c) => cats.add(c));

  if (/pric|plan|billing|subscri/.test(t)) add("pricing", "faq", "testimonials");
  if (/dash|admin|analytic|console|portal|app\b/.test(t)) add("dashboard", "cards", "navigation");
  if (/commerce|shop|store|product|catalog/.test(t)) add("cards", "testimonials", "faq");
  if (/contact|sign.?up|register|login|onboard|lead|form|waitlist/.test(t)) add("forms");
  if (/landing|home|market|saas|startup|launch|website/.test(t))
    add("feature-grid", "testimonials", "navigation", "footer");
  if (/about|team|agency|portfolio|studio/.test(t)) add("cards", "testimonials", "footer");
  if (/faq|help|support|docs?/.test(t)) add("faq", "forms");

  // Unrecognized page type: fall back to the broad marketing-page set.
  if (cats.size === 2) add("feature-grid", "testimonials", "navigation", "footer");
  return [...cats];
}

/**
 * Fetch top patterns per category. Every failure (DB unreachable, module
 * error) degrades to an empty list — callers always get usable context.
 */
export async function gatherPatterns(
  categories: string[],
  industry?: string,
): Promise<PublicPattern[]> {
  const perCategory = await Promise.all(
    categories.map(async (category) => {
      try {
        if (industry) {
          const scoped = await findPatterns({ category, industry, limit: 3 });
          if (scoped.length > 0) return scoped;
        }
        return await findPatterns({ category, limit: 3 });
      } catch {
        return [] as PublicPattern[];
      }
    }),
  );

  const seen = new Set<string>();
  const merged: PublicPattern[] = [];
  for (const row of perCategory.flat()) {
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    merged.push(row);
  }
  return merged.slice(0, 18);
}

export function serializePatterns(rows: PublicPattern[]): string {
  if (rows.length === 0) return "(none)";
  return rows
    .map((p) =>
      JSON.stringify({
        slug: p.slug,
        name: p.name,
        category: p.category,
        whyItWorks: p.whyItWorks,
        conversionScore: p.conversionScore,
        spec: p.spec ?? undefined,
      }),
    )
    .join("\n");
}

export function serializeHits(hits: SearchHit[]): string {
  if (hits.length === 0) return "(none)";
  return hits
    .map((h) =>
      JSON.stringify({
        kind: h.kind,
        id: h.id,
        title: h.title,
        snippet: h.snippet.slice(0, 500),
      }),
    )
    .join("\n");
}

export async function searchMemorySafe(
  query: string,
  opts?: { industry?: string; limit?: number },
): Promise<SearchHit[]> {
  try {
    return await searchMemory(query, opts);
  } catch {
    return [];
  }
}

export const BUNDLE_SYSTEM_PROMPT = `You are Sentinel's principal design director assembling an opinionated, concrete build brief for a coding agent.

Rules:
- Be concrete everywhere: real pixel values, real column counts, container max-widths, type sizes, spacing steps. Never write vague advice like "use good spacing".
- patternSlug fields may ONLY contain slugs that literally appear in the provided CONTEXT. If no context pattern fits, use null and still give a full recommendation from expert knowledge.
- "sources" may only list slugs/titles/ids present in the CONTEXT. If the CONTEXT is empty, sources must be [].
- promptEnhancement is a dense directive block a coding agent can follow verbatim: imperative sentences, concrete numbers, mobile-first, WCAG AA as the accessibility floor, restrained purposeful motion.
- When CONTEXT is empty or thin, answer fully from principal-level expert knowledge — the brief must never get weaker because retrieval found nothing.
- MOBILE IS MANDATORY, SPACING INCLUDED: spacingRules must state the mobile spacing system explicitly (edge gutters in px, mobile section padding compressed from desktop — e.g. 96-128px stepping to 48-64px, stack gaps on the 8px scale), and promptEnhancement must contain a mobile spec block: breakpoints, nav collapse behavior, tap-target minimums (44px, 8px between), mobile type steps (body/inputs >= 16px), and the mobile spacing values. A bundle without concrete mobile spacing is incomplete.`;

export async function retrieveBestPractices(input: {
  pageType: string;
  industry?: string;
  brandPersonality?: string;
  goals?: string[];
}): Promise<BestPracticeBundle> {
  const { pageType, industry, brandPersonality, goals } = input;

  const patterns = await gatherPatterns(relevantCategories(pageType), industry);
  const hits = await searchMemorySafe(
    [pageType, industry, brandPersonality].filter(Boolean).join(" "),
    { industry, limit: 6 },
  );

  const user = [
    `Assemble the best-practice bundle for:`,
    `- pageType: ${pageType}`,
    `- industry: ${industry ?? "unspecified"}`,
    `- brandPersonality: ${brandPersonality ?? "unspecified"}`,
    `- goals: ${goals && goals.length > 0 ? goals.join("; ") : "unspecified"}`,
    ``,
    `CONTEXT — PATTERNS (one JSON object per line):`,
    serializePatterns(patterns),
    ``,
    `CONTEXT — MEMORIES & INSIGHTS (one JSON object per line):`,
    serializeHits(hits),
  ].join("\n");

  return completeJSON({
    system: BUNDLE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: user }],
    schema: BestPracticeBundleSchema,
  });
}
