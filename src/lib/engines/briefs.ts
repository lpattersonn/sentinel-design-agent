import { z } from "zod/v4";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisMessages,
} from "@/lib/engines/analyzer";
import {
  SCORING_SYSTEM_PROMPT,
  prepareScoreSource,
  type ScoreInput,
} from "@/lib/engines/scorer";
import {
  BUNDLE_SYSTEM_PROMPT,
  gatherPatterns,
  relevantCategories,
  searchMemorySafe,
  serializeHits,
  serializePatterns,
} from "@/lib/engines/bestPractices";
import { PROMPT_SYSTEM_PROMPT, inferPageType } from "@/lib/engines/promptBuilder";
import { LAYOUT_SYSTEM_PROMPT } from "@/lib/engines/layout";
import { DESIGN_SYSTEM_SYSTEM_PROMPT } from "@/lib/engines/designSystem";
import { INSIGHT_SYSTEM_PROMPT } from "@/lib/engines/learning";
import {
  BestPracticeBundleSchema,
  DesignAnalysisSchema,
  DesignSystemSpecSchema,
  InsightDraftSchema,
  LayoutSuggestionSchema,
  PromptEnhancementSchema,
  ScoreBreakdownSchema,
  type AnalyzeInput,
  type LearnInput,
} from "@/lib/types";

/**
 * A client-brain brief: Sentinel prepares the material and the contract; the
 * connected agent's own model performs the reasoning. `instructions` is the
 * system-prompt-grade guidance for the task, `outputSchema` is the JSON Schema
 * the result must satisfy, and `then` says what to do with the result.
 */
export type ClientBrief = {
  mode: "client-brain";
  task: string;
  instructions: string;
  source?: string;
  context?: string;
  outputSchema: unknown;
  then: string;
};

const STALE_TOOLS_HINT =
  " If the save tool is missing from your tool list, your MCP connection predates it — reconnect to the sentinel server (/mcp → reconnect, or a new session) and it will appear; do not fall back to writing files.";

async function gatherContext(
  pageType: string,
  industry?: string,
  extraQuery?: string,
): Promise<string> {
  const [patterns, hits] = await Promise.all([
    gatherPatterns(relevantCategories(pageType), industry),
    searchMemorySafe(
      [pageType, industry, extraQuery].filter(Boolean).join(" "),
      { industry, limit: 6 },
    ),
  ]);
  return [
    "CONTEXT — PATTERNS from Sentinel's library (one JSON object per line):",
    serializePatterns(patterns),
    "",
    "CONTEXT — MEMORIES & INSIGHTS from Sentinel's memory (one JSON object per line):",
    serializeHits(hits),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// analyze_design → brief → save_design_analysis
// ---------------------------------------------------------------------------

export async function analysisBrief(input: AnalyzeInput): Promise<{
  brief: ClientBrief;
  image?: { data: string; mimeType: string };
}> {
  const [message] = await buildAnalysisMessages(input);

  let source = "";
  let image: { data: string; mimeType: string } | undefined;
  if (typeof message.content === "string") {
    source = message.content;
  } else {
    for (const block of message.content) {
      if (block.type === "text") source = block.text;
      else if (block.type === "image" && block.source.type === "base64") {
        image = { data: block.source.data, mimeType: block.source.media_type };
      }
    }
  }

  const sourceRef =
    input.sourceType === "url" || input.sourceType === "figma"
      ? input.content
      : undefined;

  const meta = {
    sourceType: input.sourceType,
    ...(sourceRef ? { sourceRef } : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(input.industry ? { industry: input.industry } : {}),
    ...(input.brand ? { brand: input.brand } : {}),
    ...(input.tags?.length ? { tags: input.tags } : {}),
    ...(input.confidential ? { confidential: true } : {}),
  };

  return {
    brief: {
      mode: "client-brain",
      task: "Analyze this design and extract structured, transferable design knowledge.",
      instructions: ANALYSIS_SYSTEM_PROMPT,
      source,
      outputSchema: z.toJSONSchema(DesignAnalysisSchema),
      then: `Produce the analysis as a JSON object satisfying outputSchema, then call the save_design_analysis tool with { analysis: <your JSON>, ${JSON.stringify(meta).slice(1, -1)} } so it becomes a permanent design memory.${STALE_TOOLS_HINT}`,
    },
    image,
  };
}

// ---------------------------------------------------------------------------
// score_design → brief → save_design_score
// ---------------------------------------------------------------------------

export async function scoreBrief(input: ScoreInput): Promise<ClientBrief> {
  const { sourceText, target } = await prepareScoreSource(input);
  const saveArgs = [
    `target: ${JSON.stringify(target)}`,
    input.projectId ? `projectId: ${JSON.stringify(input.projectId)}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  return {
    mode: "client-brain",
    task: "Score this design on eleven dimensions, 0-100 each, with evidence-based reasoning.",
    instructions: SCORING_SYSTEM_PROMPT,
    source: sourceText,
    outputSchema: z.toJSONSchema(ScoreBreakdownSchema),
    then: `Produce the score breakdown as a JSON object satisfying outputSchema, then call the save_design_score tool with { breakdown: <your JSON>, ${saveArgs} } to record it. Finally, apply the topImprovements to the design.${STALE_TOOLS_HINT}`,
  };
}

// ---------------------------------------------------------------------------
// Briefs whose results are consumed directly (no save step)
// ---------------------------------------------------------------------------

export async function bestPracticesBrief(input: {
  pageType: string;
  industry?: string;
  brandPersonality?: string;
  goals?: string[];
}): Promise<ClientBrief> {
  return {
    mode: "client-brain",
    task: `Assemble the best-practice bundle for a ${input.pageType}${input.industry ? ` in the ${input.industry} industry` : ""}${input.brandPersonality ? ` with a "${input.brandPersonality}" brand personality` : ""}${input.goals?.length ? ` optimizing for: ${input.goals.join(", ")}` : ""}.`,
    instructions: BUNDLE_SYSTEM_PROMPT,
    context: await gatherContext(input.pageType, input.industry, input.brandPersonality),
    outputSchema: z.toJSONSchema(BestPracticeBundleSchema),
    then: "Assemble the bundle yourself following the instructions, grounding patternSlug and sources strictly in the CONTEXT. Then follow the bundle — especially promptEnhancement — while building. No save call needed.",
  };
}

export async function promptBrief(input: {
  prompt: string;
  pageType?: string;
  industry?: string;
}): Promise<ClientBrief> {
  const pageType = input.pageType ?? inferPageType(input.prompt);
  return {
    mode: "client-brain",
    task: "Rewrite the build prompt below into a design-directed prompt with concrete rules.",
    instructions: PROMPT_SYSTEM_PROMPT,
    source: `Original prompt:\n${input.prompt}`,
    context: await gatherContext(pageType, input.industry),
    outputSchema: z.toJSONSchema(PromptEnhancementSchema),
    then: "Produce the enhancement yourself following the instructions, then execute enhancedPrompt instead of the original request. No save call needed.",
  };
}

export async function layoutBrief(input: {
  pageType: string;
  industry: string;
  goals?: string[];
}): Promise<ClientBrief> {
  return {
    mode: "client-brain",
    task: `Design the section-by-section layout for a ${input.pageType} in the ${input.industry} industry${input.goals?.length ? `, optimizing for: ${input.goals.join(", ")}` : ""}.`,
    instructions: LAYOUT_SYSTEM_PROMPT,
    context: await gatherContext(input.pageType, input.industry),
    outputSchema: z.toJSONSchema(LayoutSuggestionSchema),
    then: "Produce the layout yourself following the instructions (patternSlug only from CONTEXT), then build the sections top to bottom in that order. No save call needed.",
  };
}

export async function designSystemBrief(input: {
  brandPersonality: string;
  industry: string;
  inspiration?: string[];
}): Promise<ClientBrief> {
  const hits = await searchMemorySafe(
    [input.brandPersonality, input.industry, ...(input.inspiration ?? [])].join(" "),
    { limit: 6 },
  );
  return {
    mode: "client-brain",
    task: `Generate a complete design system for a "${input.brandPersonality}" brand in the ${input.industry} industry${input.inspiration?.length ? `, drawing on: ${input.inspiration.join(", ")}` : ""}.`,
    instructions: DESIGN_SYSTEM_SYSTEM_PROMPT,
    context: [
      "CONTEXT — MEMORIES & INSIGHTS from Sentinel's memory (one JSON object per line):",
      serializeHits(hits),
    ].join("\n"),
    outputSchema: z.toJSONSchema(DesignSystemSpecSchema),
    then: "Produce the design system yourself following the instructions, then apply its tokens consistently instead of inventing values ad hoc. No save call needed.",
  };
}

// ---------------------------------------------------------------------------
// learn → distillation brief → save_insight
// ---------------------------------------------------------------------------

export function insightBrief(feedbackId: string, input: LearnInput): ClientBrief {
  return {
    mode: "client-brain",
    task: "Distill this project feedback into a reusable design lesson (or decide it teaches nothing transferable).",
    instructions: INSIGHT_SYSTEM_PROMPT,
    source: [
      `Project: ${input.project}`,
      input.industry ? `Industry: ${input.industry}` : null,
      `Outcome: ${input.outcome}`,
      input.componentsChanged?.length
        ? `Components changed: ${input.componentsChanged.join(", ")}`
        : null,
      `Feedback details:\n${input.details ?? ""}`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
    outputSchema: z.toJSONSchema(InsightDraftSchema),
    then: `If worthKeeping is true, call the save_insight tool with { kind, content, confidence, feedbackId: "${feedbackId}" }. If worthKeeping is false, do nothing further.${STALE_TOOLS_HINT}`,
  };
}
