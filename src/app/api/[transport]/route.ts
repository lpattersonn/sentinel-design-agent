import { createMcpHandler } from "mcp-handler";
import { z } from "zod/v4";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { brainMode } from "@/lib/brain";
import {
  AnalyzeInputSchema,
  DesignAnalysisSchema,
  InsightDraftSchema,
  LearnInputSchema,
  ScoreBreakdownSchema,
} from "@/lib/types";
import { analyzeDesign, persistAnalysis } from "@/lib/engines/analyzer";
import { findPatterns } from "@/lib/engines/patterns";
import { retrieveBestPractices } from "@/lib/engines/bestPractices";
import { persistScore, scoreDesign } from "@/lib/engines/scorer";
import { improvePrompt } from "@/lib/engines/promptBuilder";
import {
  MIN_DISTILL_DETAILS_CHARS,
  learn,
  persistInsight,
} from "@/lib/engines/learning";
import { searchMemory } from "@/lib/engines/retrieval";
import { suggestLayout } from "@/lib/engines/layout";
import { generateDesignSystem } from "@/lib/engines/designSystem";
import {
  analysisBrief,
  bestPracticesBrief,
  designSystemBrief,
  insightBrief,
  layoutBrief,
  promptBrief,
  scoreBrief,
  type ClientBrief,
} from "@/lib/engines/briefs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Resolved once per process — SENTINEL_BRAIN / ANTHROPIC_API_KEY are fixed per deploy.
const MODE = brainMode();
const CLIENT = MODE === "client";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string };

type ToolResult = {
  content: ContentBlock[];
  isError?: boolean;
};

function ok(result: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

function okBrief(
  brief: ClientBrief,
  image?: { data: string; mimeType: string },
): ToolResult {
  const content: ContentBlock[] = [
    { type: "text", text: JSON.stringify(brief, null, 2) },
  ];
  if (image) content.push({ type: "image", data: image.data, mimeType: image.mimeType });
  return { content };
}

function fail(err: unknown): ToolResult {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: "text", text: "Error: " + message }], isError: true };
}

/** Server-brain tools finish the work; client-brain tools brief the caller. */
const briefNote =
  " NOTE (client-brain mode): this tool returns a BRIEF — prepared source material, instructions, and a JSON output schema. YOU perform the reasoning, following the brief exactly, then do what its `then` field says.";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "analyze_design",
      "Analyze a design from a URL, raw HTML, screenshot (base64), Figma link, or textual description. Extracts spacing system, typography, hierarchy, grid, colors, component patterns, accessibility level, and transferable lessons, then stores the result in Sentinel's design memory. Call this whenever you encounter a well-designed page or asset worth learning from — the analysis compounds into better future recommendations." +
        (CLIENT ? briefNote + " Persist your analysis via save_design_analysis." : ""),
      AnalyzeInputSchema.shape,
      async (args) => {
        try {
          if (CLIENT) {
            const { brief, image } = await analysisBrief(args);
            return okBrief(brief, image);
          }
          return ok(await analyzeDesign(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "find_patterns",
      "Search Sentinel's library of proven, reusable UI patterns (hero, pricing, cta, testimonials, navigation, cards, forms, dashboard, feature-grid, faq, footer). Call this when deciding HOW to build a specific section — each pattern includes why it works, strengths, weaknesses, ideal use cases, complexity, and a conversion score. Filter by category, industry, or free-text query.",
      {
        category: z
          .string()
          .optional()
          .describe("Pattern category, e.g. 'hero', 'pricing', 'cta', 'navigation'"),
        industry: z.string().optional().describe("Filter to patterns proven in this industry, e.g. 'saas'"),
        query: z.string().optional().describe("Free-text search over pattern names and descriptions"),
        limit: z.number().int().positive().optional().describe("Max patterns to return (default 8)"),
      },
      async (args) => {
        try {
          return ok(await findPatterns(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "retrieve_best_practices",
      "Call BEFORE building any page or UI section. Returns a complete best-practice bundle for the page type: hero and CTA recommendations, typography direction, concrete spacing rules, grid spec, color system, per-component recommendations, interaction rules, accessibility notes, and a ready-to-use promptEnhancement block of design directives — all grounded in Sentinel's learned patterns and memories. Skipping this call means building without the accumulated design intelligence." +
        (CLIENT ? briefNote + " Assemble the bundle yourself from the provided CONTEXT, then follow it while building." : ""),
      {
        pageType: z
          .string()
          .describe("What is being built, e.g. 'landing page', 'pricing page', 'dashboard'"),
        industry: z.string().optional().describe("Target industry, e.g. 'fintech', 'saas'"),
        brandPersonality: z
          .string()
          .optional()
          .describe("Brand feel, e.g. 'premium minimal', 'playful technical'"),
        goals: z.array(z.string()).optional().describe("Business goals, e.g. ['signups', 'trust']"),
      },
      async (args) => {
        try {
          if (CLIENT) return okBrief(await bestPracticesBrief(args));
          return ok(await retrieveBestPractices(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "score_design",
      "Score a design you just built (or found) on 11 dimensions — visual hierarchy, accessibility, spacing, consistency, readability, conversion, mobile, performance, modern design, animation, component quality — each 0-100 with reasoning, plus an overall verdict and ordered top improvements. Call AFTER producing any page or significant UI section to catch weaknesses before the user sees them, then apply the top improvements. Provide html, a url, or a description (at least one)." +
        (CLIENT ? briefNote + " Persist your breakdown via save_design_score." : ""),
      {
        html: z.string().optional().describe("Raw HTML of the design to score"),
        url: z.string().optional().describe("URL of a live page to fetch and score"),
        description: z.string().optional().describe("Textual description when no source is available"),
        context: z
          .string()
          .optional()
          .describe("What the design is for — page type, audience, goals — to sharpen the scoring"),
        projectId: z.string().optional().describe("Sentinel project id to attach this score to"),
      },
      async (args) => {
        try {
          if (CLIENT) return okBrief(await scoreBrief(args));
          return ok(await scoreDesign(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "improve_prompt",
      "Rewrite a build prompt into a design-directed one. Call BEFORE acting on any user request to build UI: pass the raw request and get back an enhanced prompt layered with concrete design rules (spacing in px, grid spec, named fonts, color anchors, motion, accessibility), the discrete rules injected, and the inspiration drawn on. Then follow the enhanced prompt instead of the original." +
        (CLIENT ? briefNote + " Produce the enhancement yourself, then execute your enhancedPrompt." : ""),
      {
        prompt: z.string().describe("The original build prompt or user request, verbatim"),
        pageType: z
          .string()
          .optional()
          .describe("Page type if known, e.g. 'landing page'; inferred from the prompt otherwise"),
        industry: z.string().optional().describe("Target industry, e.g. 'healthcare'"),
      },
      async (args) => {
        try {
          if (CLIENT) return okBrief(await promptBrief(args));
          return ok(await improvePrompt(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "learn",
      "Record a project outcome so Sentinel gets smarter. Call whenever a design outcome is known — the client accepted it, requested revisions, it converted, or it was rejected. Adjusts the scores of the patterns and memories that informed the work and distills durable insights from substantive feedback. This is the feedback loop: unreported outcomes are lessons lost." +
        (CLIENT
          ? " NOTE (client-brain mode): the feedback and score adjustments are recorded immediately; when the response includes a distillation brief, YOU distill the insight and persist it via save_insight."
          : ""),
      LearnInputSchema.shape,
      async (args) => {
        try {
          const result = await learn(args);
          const details = args.details?.trim() ?? "";
          if (CLIENT && details.length > MIN_DISTILL_DETAILS_CHARS) {
            return ok({
              ...result,
              distillation: insightBrief(result.feedbackId, args),
            });
          }
          return ok(result);
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "search_memory",
      "Semantic search over everything Sentinel has learned: analyzed design memories and distilled insights. Call when you want references, precedents, or lessons relevant to the task at hand — e.g. 'dark hero sections for developer tools' or 'pricing page conversion lessons'. Returns ranked hits with snippets and full data.",
      {
        query: z.string().describe("Natural-language search query"),
        industry: z.string().optional().describe("Restrict results to this industry"),
        limit: z.number().int().positive().optional().describe("Max hits to return"),
      },
      async (args) => {
        try {
          return ok(await searchMemory(args.query, { industry: args.industry, limit: args.limit }));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "suggest_layout",
      "Get a complete page layout before writing any markup: an ordered section list (each with description, rationale, and a proven pattern slug where one applies), grid spec, navigation structure, mobile behavior, and the conversion levers the layout pulls. Call at the START of building any full page — build the sections top to bottom in the returned order." +
        (CLIENT ? briefNote + " Produce the layout yourself, then build it top to bottom." : ""),
      {
        pageType: z.string().describe("e.g. 'landing page', 'pricing page', 'product page'"),
        industry: z.string().describe("Target industry, e.g. 'saas', 'ecommerce'"),
        goals: z.array(z.string()).optional().describe("e.g. ['demo bookings', 'newsletter signups']"),
      },
      async (args) => {
        try {
          if (CLIENT) return okBrief(await layoutBrief(args));
          return ok(await suggestLayout(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "generate_design_system",
      "Generate a complete, brand-specific design system: color tokens with hex values and usage, heading/body fonts with a full type scale, spacing scale, radii, shadows, motion (durations, easing, principles), and per-component guidelines. Call at the start of any new project or when a design lacks a coherent system — then apply the tokens consistently instead of inventing values ad hoc." +
        (CLIENT ? briefNote + " Produce the system yourself, then apply its tokens consistently." : ""),
      {
        brandPersonality: z
          .string()
          .describe("The brand's personality, e.g. 'warm, editorial, trustworthy'"),
        industry: z.string().describe("Target industry, e.g. 'legal tech'"),
        inspiration: z
          .array(z.string())
          .optional()
          .describe("Brands or designs to draw from, e.g. ['Stripe', 'Linear']"),
      },
      async (args) => {
        try {
          if (CLIENT) return okBrief(await designSystemBrief(args));
          return ok(await generateDesignSystem(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    // -----------------------------------------------------------------------
    // Persistence tools — the write-back half of client-brain mode. Registered
    // in both modes; Sentinel validates every payload against its schemas, so
    // malformed results are rejected rather than stored.
    // -----------------------------------------------------------------------

    server.tool(
      "save_design_analysis",
      "Persist a completed DesignAnalysis into Sentinel's design memory. Call after completing the analysis from an analyze_design brief. The analysis is validated against Sentinel's schema; pass the source metadata you were given in the brief.",
      {
        analysis: DesignAnalysisSchema,
        sourceType: AnalyzeInputSchema.shape.sourceType,
        sourceRef: z.string().optional().describe("Original URL or Figma link when applicable"),
        title: z.string().optional().describe("Human-readable memory title"),
        industry: z.string().optional(),
        brand: z.string().optional(),
        tags: z.array(z.string()).optional(),
        confidential: z
          .boolean()
          .optional()
          .describe(
            "true when this is the agency's own client work — identity is then redacted on every agent-facing read; keep client names out of the analysis text itself",
          ),
      },
      async (args) => {
        try {
          const { analysis, ...meta } = args;
          return ok(await persistAnalysis(meta, analysis));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "save_design_score",
      "Persist a completed 11-dimension ScoreBreakdown produced from a score_design brief. Validated against Sentinel's schema before storage.",
      {
        breakdown: ScoreBreakdownSchema,
        target: z.string().describe("The target label from the brief (url / description excerpt)"),
        projectId: z.string().optional().describe("Sentinel project id to attach this score to"),
      },
      async (args) => {
        try {
          return ok(await persistScore(args.breakdown, args.target, args.projectId));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "save_insight",
      "Persist a distilled design insight into Sentinel's shared brain — call after completing the distillation brief returned by learn, and only when the lesson is genuinely reusable (worthKeeping). Marks the source feedback event as learned.",
      {
        kind: InsightDraftSchema.shape.kind,
        content: z.string().min(10).describe("The distilled, reusable lesson in 1-3 sentences"),
        confidence: z.number().min(0).max(1),
        feedbackId: z.string().optional().describe("The feedbackId from the learn result"),
      },
      async (args) => {
        try {
          return ok(
            await persistInsight(
              { kind: args.kind, content: args.content, confidence: args.confidence },
              { feedbackId: args.feedbackId },
            ),
          );
        } catch (err) {
          return fail(err);
        }
      },
    );
  },
  {},
  { basePath: "/api", maxDuration: 300, verboseLogs: false, disableSse: true },
);

const withAuth =
  (h: (req: Request) => Promise<Response> | Response) => async (req: Request) => {
    if (!isAuthorized(req)) return unauthorized();
    const limited = await enforceRateLimit(req);
    if (limited) return limited;
    // The /mcp alias (next.config rewrite) preserves the original URL, but
    // mcp-handler matches the pathname against basePath — normalize it.
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) {
      url.pathname = `/api${url.pathname}`;
      req = new Request(url, req);
    }
    return h(req);
  };

export const GET = withAuth(handler);
export const POST = withAuth(handler);
export const DELETE = withAuth(handler);
