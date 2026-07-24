import { completeJSON } from "@/lib/ai/client";
import {
  gatherPatterns,
  relevantCategories,
  searchMemorySafe,
  serializeHits,
  serializePatterns,
} from "@/lib/engines/bestPractices";
import { PromptEnhancementSchema, type PromptEnhancement } from "@/lib/types";

/** Cheap keyword inference — good enough to pick retrieval categories. */
export function inferPageType(prompt: string): string {
  const t = prompt.toLowerCase();
  const rules: [RegExp, string][] = [
    [/pricing|plans? page|billing|subscription/, "pricing page"],
    [/dashboard|admin panel|analytics|console/, "dashboard"],
    [/checkout|cart/, "checkout page"],
    [/e-?commerce|online store|shop|product page|catalog/, "product page"],
    [/portfolio/, "portfolio site"],
    [/blog|article/, "blog"],
    [/docs|documentation|help center|support/, "documentation page"],
    [/contact|waitlist|sign.?up|register|login|onboard/, "signup page"],
    [/landing|home ?page|marketing site|website|hero/, "landing page"],
  ];
  for (const [re, type] of rules) if (re.test(t)) return type;
  return "landing page";
}

export const PROMPT_SYSTEM_PROMPT = `You are Sentinel's prompt engineer for UI builds — a principal design director who rewrites loose build requests into design-directed build prompts a coding agent executes verbatim.

Rules:
- enhancedPrompt must preserve every explicit requirement of the original prompt, then layer concrete design direction: container max-width, grid columns and gutters, spacing scale in px, named font stack with sizes/weights/line-heights, color direction with hex anchors, motion (durations/easing), WCAG AA accessibility, mobile-first breakpoints.
- designRules is the discrete list of rules you injected — each self-contained and specific (e.g. "Section vertical padding: 96px desktop / 64px mobile"), never restating the user's own requirements.
- inspiration names the brands, memories, or insights actually drawn on (from the provided context, or well-known exemplars when context is empty).
- rationale explains in a short paragraph why this direction fits the page type and industry.
- If the BEST-PRACTICE CONTEXT is unavailable or empty, direct from expert knowledge — the output must never be weaker for it.`;

export async function improvePrompt(input: {
  prompt: string;
  pageType?: string;
  industry?: string;
}): Promise<PromptEnhancement> {
  const pageType = input.pageType?.trim() || inferPageType(input.prompt);

  // Gather raw context cheaply (DB + vector search, no LLM call) so the whole
  // enhancement costs a single completion — fast enough for sync functions.
  let patternsBlock = "(unavailable — rely on expert knowledge)";
  let hitsBlock = "(unavailable — rely on expert knowledge)";
  try {
    const [patterns, hits] = await Promise.all([
      gatherPatterns(relevantCategories(pageType), input.industry),
      searchMemorySafe([pageType, input.industry].filter(Boolean).join(" "), {
        industry: input.industry,
        limit: 6,
      }),
    ]);
    patternsBlock = serializePatterns(patterns);
    hitsBlock = serializeHits(hits);
  } catch {
    // retrieval failure — fall back to expert knowledge
  }

  const user = [
    `ORIGINAL PROMPT:`,
    input.prompt,
    ``,
    `pageType: ${pageType}`,
    `industry: ${input.industry ?? "unspecified"}`,
    ``,
    `BEST-PRACTICE CONTEXT — PATTERNS (one JSON object per line):`,
    patternsBlock,
    ``,
    `BEST-PRACTICE CONTEXT — MEMORIES & INSIGHTS (one JSON object per line):`,
    hitsBlock,
    ``,
    `Rewrite the original prompt into a design-directed build prompt.`,
  ].join("\n");

  return completeJSON({
    system: PROMPT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: user }],
    schema: PromptEnhancementSchema,
  });
}
