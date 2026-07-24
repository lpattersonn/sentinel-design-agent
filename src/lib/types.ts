import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Design analysis (output of the Design Analyzer)
// ---------------------------------------------------------------------------

export const DesignAnalysisSchema = z.object({
  summary: z.string().describe("2-4 sentence summary of the design and what makes it work"),
  style: z.string().describe("The overall aesthetic in a short phrase, e.g. 'minimal luxury'"),
  industry: z.string().nullable().describe("Best-guess industry, null if unclear"),
  brandPersonality: z.array(z.string()).describe("e.g. ['premium', 'playful', 'technical']"),
  spacing: z.object({
    system: z.string().describe("e.g. '8px base grid', 'inconsistent'"),
    baseUnit: z.number().nullable().describe("Base spacing unit in px if detectable"),
    sectionSpacing: z.string().describe("Vertical rhythm between sections"),
    notes: z.string(),
  }),
  typography: z.object({
    headingFont: z.string().nullable(),
    bodyFont: z.string().nullable(),
    scale: z.string().describe("Type scale description, e.g. 'large display, tight 1.1 leading'"),
    hierarchyNotes: z.string(),
  }),
  hierarchy: z.object({
    strength: z.enum(["weak", "moderate", "strong"]),
    focalPoints: z.array(z.string()),
    notes: z.string(),
  }),
  grid: z.object({
    columns: z.number().nullable(),
    containerWidth: z.string().nullable().describe("e.g. '1280px'"),
    notes: z.string(),
  }),
  visualRhythm: z.string().describe("How the eye moves through the page"),
  colors: z.object({
    palette: z.array(z.object({ hex: z.string(), role: z.string() })),
    notes: z.string(),
  }),
  componentPatterns: z.array(
    z.object({
      category: z.string().describe("hero | pricing | cta | testimonials | navigation | cards | forms | dashboard | feature-grid | faq | footer | other"),
      description: z.string(),
      whyItWorks: z.string(),
    }),
  ),
  animation: z.object({
    present: z.boolean(),
    style: z.string().describe("e.g. 'subtle fade/slide on scroll', 'none detectable from static source'"),
    notes: z.string(),
  }),
  accessibility: z.object({
    estimatedLevel: z.enum(["poor", "partial-AA", "AA", "AAA"]),
    issues: z.array(z.string()),
    strengths: z.array(z.string()),
  }),
  responsiveness: z.object({
    approach: z.string().describe("e.g. 'mobile-first, single breakpoint at 768px'"),
    notes: z.string(),
  }),
  traits: z.array(z.string()).describe("Short memorable traits, e.g. 'large typography', 'strong whitespace'"),
  lessons: z.array(z.string()).describe("Transferable design lessons Claude should apply elsewhere"),
});
export type DesignAnalysis = z.infer<typeof DesignAnalysisSchema>;

export const AnalyzeInputSchema = z.object({
  sourceType: z.enum(["url", "html", "screenshot", "figma", "description"]),
  content: z
    .string()
    .describe(
      "url: the page URL · html: raw HTML · screenshot: base64 PNG/JPEG · figma: public Figma link or exported image URL · description: textual description of the design",
    ),
  title: z.string().optional(),
  industry: z.string().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;

export type AnalyzeResult = {
  memoryId: string;
  analysis: DesignAnalysis;
};

// ---------------------------------------------------------------------------
// Design scoring
// ---------------------------------------------------------------------------

const dimension = z.object({
  score: z.number().describe("0-100"),
  reasoning: z.string(),
});

export const ScoreBreakdownSchema = z.object({
  visualHierarchy: dimension,
  accessibility: dimension,
  spacing: dimension,
  consistency: dimension,
  readability: dimension,
  conversion: dimension,
  mobile: dimension,
  performance: dimension,
  modernDesign: dimension,
  animation: dimension,
  componentQuality: dimension,
  overall: z.number().describe("0-100, weighted judgment — not a plain average"),
  verdict: z.string().describe("One-paragraph overall assessment"),
  topImprovements: z.array(z.string()).describe("Highest-impact improvements, ordered"),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export type ScoreResult = {
  scoreId: string;
  breakdown: ScoreBreakdown;
};

// ---------------------------------------------------------------------------
// Retrieval / best practices
// ---------------------------------------------------------------------------

export type SearchHit = {
  kind: "memory" | "insight";
  id: string;
  title: string;
  snippet: string;
  score: number; // similarity or relevance, higher = better
  data: unknown;
};

export const BestPracticeBundleSchema = z.object({
  hero: z.object({ recommendation: z.string(), patternSlug: z.string().nullable() }),
  cta: z.object({ recommendation: z.string(), patternSlug: z.string().nullable() }),
  typography: z.string(),
  spacingRules: z.array(z.string()),
  grid: z.string(),
  colorSystem: z.string(),
  components: z.array(
    z.object({ category: z.string(), recommendation: z.string(), patternSlug: z.string().nullable() }),
  ),
  interactionRules: z.array(z.string()),
  accessibilityNotes: z.array(z.string()),
  promptEnhancement: z
    .string()
    .describe("A dense block of concrete design directives ready to paste into a build prompt"),
  sources: z.array(z.string()).describe("Names/ids of patterns, memories and insights used"),
});
export type BestPracticeBundle = z.infer<typeof BestPracticeBundleSchema>;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

export const PromptEnhancementSchema = z.object({
  enhancedPrompt: z.string().describe("The rewritten, design-directed prompt"),
  designRules: z.array(z.string()).describe("The concrete rules injected, e.g. '64px top spacing'"),
  inspiration: z.array(z.string()).describe("References drawn on, e.g. 'Typography inspired by Linear'"),
  rationale: z.string(),
});
export type PromptEnhancement = z.infer<typeof PromptEnhancementSchema>;

// ---------------------------------------------------------------------------
// Design system generator
// ---------------------------------------------------------------------------

export const DesignSystemSpecSchema = z.object({
  name: z.string(),
  colors: z.array(z.object({ token: z.string(), hex: z.string(), usage: z.string() })),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    scale: z.array(z.object({ token: z.string(), sizePx: z.number(), lineHeight: z.string(), weight: z.string() })),
  }),
  spacing: z.object({ baseUnit: z.number(), scale: z.array(z.number()) }),
  radii: z.array(z.object({ token: z.string(), valuePx: z.number() })),
  shadows: z.array(z.object({ token: z.string(), value: z.string(), usage: z.string() })),
  motion: z.object({
    durationsMs: z.array(z.number()),
    easing: z.string(),
    principles: z.array(z.string()),
  }),
  componentGuidelines: z.array(z.object({ component: z.string(), guidance: z.string() })),
  rationale: z.string(),
});
export type DesignSystemSpec = z.infer<typeof DesignSystemSpecSchema>;

// ---------------------------------------------------------------------------
// Layout suggestion
// ---------------------------------------------------------------------------

export const LayoutSuggestionSchema = z.object({
  sections: z.array(
    z.object({
      order: z.number(),
      name: z.string(),
      patternSlug: z.string().nullable(),
      description: z.string(),
      rationale: z.string(),
    }),
  ),
  grid: z.string(),
  navigation: z.string(),
  mobileNotes: z.string(),
  conversionNotes: z.string(),
});
export type LayoutSuggestion = z.infer<typeof LayoutSuggestionSchema>;

// ---------------------------------------------------------------------------
// Learning engine
// ---------------------------------------------------------------------------

export const LearnInputSchema = z.object({
  project: z.string().describe("Project name (created on the fly if unknown)"),
  outcome: z.enum(["accepted", "revision_requested", "converted", "rejected"]),
  details: z.string().optional().describe("What happened — client feedback, what changed, what converted"),
  componentsChanged: z.array(z.string()).optional(),
  patternSlugs: z.array(z.string()).optional().describe("Patterns used in this project"),
  memoryIds: z.array(z.string()).optional().describe("Design memories that informed this project"),
  industry: z.string().optional(),
});
export type LearnInput = z.infer<typeof LearnInputSchema>;

export type LearnResult = {
  feedbackId: string;
  insightId: string | null;
  adjustments: string[]; // human-readable list of score adjustments applied
};

export const InsightDraftSchema = z.object({
  worthKeeping: z.boolean().describe("false if the feedback contains no reusable lesson"),
  kind: z.enum(["layout", "typography", "color", "conversion", "industry", "process", "other"]),
  content: z.string().describe("The distilled, reusable lesson in 1-3 sentences"),
  confidence: z.number().describe("0-1"),
});
export type InsightDraft = z.infer<typeof InsightDraftSchema>;
