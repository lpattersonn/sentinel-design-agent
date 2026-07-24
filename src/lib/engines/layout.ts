import { completeJSON } from "@/lib/ai/client";
import {
  gatherPatterns,
  relevantCategories,
  searchMemorySafe,
  serializeHits,
  serializePatterns,
} from "@/lib/engines/bestPractices";
import { LayoutSuggestionSchema, type LayoutSuggestion } from "@/lib/types";

const SYSTEM = `You are Sentinel's information architect and conversion strategist. You produce page layouts as an ordered section list a coding agent builds top to bottom.

Rules:
- Order sections for narrative arc AND conversion: hook → value → proof → objection handling → action. Repeat the CTA where the funnel warrants it.
- Each section: order (1-based), a short name, a concrete description (what it contains, roughly how it is laid out), and a rationale tied to this page type, industry, and goals.
- patternSlug may ONLY contain slugs that literally appear in the provided CONTEXT; use null otherwise.
- grid: one concrete spec, e.g. "12-col, 1200px container, 24px gutters".
- navigation: concrete structure and behavior (items, CTA placement, sticky/scroll behavior).
- mobileNotes: what reorders, collapses, or resizes on small screens (mobile-first).
- conversionNotes: the specific conversion levers this layout pulls and why.
- When CONTEXT is empty, design fully from expert knowledge — never a weaker answer.`;

export async function suggestLayout(input: {
  pageType: string;
  industry: string;
  goals?: string[];
}): Promise<LayoutSuggestion> {
  const { pageType, industry, goals } = input;

  const patterns = await gatherPatterns(relevantCategories(pageType), industry);
  const hits = await searchMemorySafe(`${pageType} ${industry} layout structure`, {
    industry,
    limit: 6,
  });

  const user = [
    `Suggest the layout for:`,
    `- pageType: ${pageType}`,
    `- industry: ${industry}`,
    `- goals: ${goals && goals.length > 0 ? goals.join("; ") : "unspecified"}`,
    ``,
    `CONTEXT — PATTERNS (one JSON object per line):`,
    serializePatterns(patterns),
    ``,
    `CONTEXT — MEMORIES & INSIGHTS (one JSON object per line):`,
    serializeHits(hits),
  ].join("\n");

  return completeJSON({
    system: SYSTEM,
    messages: [{ role: "user", content: user }],
    schema: LayoutSuggestionSchema,
  });
}
