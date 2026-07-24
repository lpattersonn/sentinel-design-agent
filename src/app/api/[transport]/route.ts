import { createMcpHandler } from "mcp-handler";
import { z } from "zod/v4";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { AnalyzeInputSchema, LearnInputSchema } from "@/lib/types";
import { analyzeDesign } from "@/lib/engines/analyzer";
import { findPatterns } from "@/lib/engines/patterns";
import { retrieveBestPractices } from "@/lib/engines/bestPractices";
import { scoreDesign } from "@/lib/engines/scorer";
import { improvePrompt } from "@/lib/engines/promptBuilder";
import { learn } from "@/lib/engines/learning";
import { searchMemory } from "@/lib/engines/retrieval";
import { suggestLayout } from "@/lib/engines/layout";
import { generateDesignSystem } from "@/lib/engines/designSystem";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function ok(result: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

function fail(err: unknown): ToolResult {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: "text", text: "Error: " + message }], isError: true };
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "analyze_design",
      "Analyze a design from a URL, raw HTML, screenshot (base64), Figma link, or textual description. Extracts spacing system, typography, hierarchy, grid, colors, component patterns, accessibility level, and transferable lessons, then stores the result in Sentinel's design memory. Call this whenever you encounter a well-designed page or asset worth learning from — the analysis compounds into better future recommendations.",
      AnalyzeInputSchema.shape,
      async (args) => {
        try {
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
      "Call BEFORE building any page or UI section. Returns a complete best-practice bundle for the page type: hero and CTA recommendations, typography direction, concrete spacing rules, grid spec, color system, per-component recommendations, interaction rules, accessibility notes, and a ready-to-use promptEnhancement block of design directives — all grounded in Sentinel's learned patterns and memories. Skipping this call means building without the accumulated design intelligence.",
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
          return ok(await retrieveBestPractices(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "score_design",
      "Score a design you just built (or found) on 11 dimensions — visual hierarchy, accessibility, spacing, consistency, readability, conversion, mobile, performance, modern design, animation, component quality — each 0-100 with reasoning, plus an overall verdict and ordered top improvements. Call AFTER producing any page or significant UI section to catch weaknesses before the user sees them, then apply the top improvements. Provide html, a url, or a description (at least one).",
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
          return ok(await scoreDesign(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "improve_prompt",
      "Rewrite a build prompt into a design-directed one. Call BEFORE acting on any user request to build UI: pass the raw request and get back an enhanced prompt layered with concrete design rules (spacing in px, grid spec, named fonts, color anchors, motion, accessibility), the discrete rules injected, and the inspiration drawn on. Then follow the enhanced prompt instead of the original.",
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
          return ok(await improvePrompt(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "learn",
      "Record a project outcome so Sentinel gets smarter. Call whenever a design outcome is known — the client accepted it, requested revisions, it converted, or it was rejected. Adjusts the scores of the patterns and memories that informed the work and distills durable insights from substantive feedback. This is the feedback loop: unreported outcomes are lessons lost.",
      LearnInputSchema.shape,
      async (args) => {
        try {
          return ok(await learn(args));
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
      "Get a complete page layout before writing any markup: an ordered section list (each with description, rationale, and a proven pattern slug where one applies), grid spec, navigation structure, mobile behavior, and the conversion levers the layout pulls. Call at the START of building any full page — build the sections top to bottom in the returned order.",
      {
        pageType: z.string().describe("e.g. 'landing page', 'pricing page', 'product page'"),
        industry: z.string().describe("Target industry, e.g. 'saas', 'ecommerce'"),
        goals: z.array(z.string()).optional().describe("e.g. ['demo bookings', 'newsletter signups']"),
      },
      async (args) => {
        try {
          return ok(await suggestLayout(args));
        } catch (err) {
          return fail(err);
        }
      },
    );

    server.tool(
      "generate_design_system",
      "Generate a complete, brand-specific design system: color tokens with hex values and usage, heading/body fonts with a full type scale, spacing scale, radii, shadows, motion (durations, easing, principles), and per-component guidelines. Call at the start of any new project or when a design lacks a coherent system — then apply the tokens consistently instead of inventing values ad hoc.",
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
          return ok(await generateDesignSystem(args));
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
