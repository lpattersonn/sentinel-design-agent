import { completeJSON } from "@/lib/ai/client";
import { searchMemorySafe, serializeHits } from "@/lib/engines/bestPractices";
import { DesignSystemSpecSchema, type DesignSystemSpec } from "@/lib/types";

export const DESIGN_SYSTEM_SYSTEM_PROMPT = `You are Sentinel's design-system architect — a principal brand designer producing distinctive, cohesive token systems.

Rules:
- Never default AI aesthetics. Forbidden unless the brief explicitly demands them: purple-gradient-on-white, Inter/Roboto/Open Sans as reflexive picks, evenly-spaced rainbow accent sets.
- Name specific, widely available fonts (Google Fonts or common system-adjacent faces) chosen FOR this personality — e.g. Fraunces, Space Grotesk, Newsreader, Bricolage Grotesque, IBM Plex families, Instrument Serif — not a generic sans by habit.
- Colors: real hex values with a clear role each (background, surface, ink, primary, accent, success/danger where relevant). The palette must read as authored for this one brand — anchored in the personality and industry, with deliberate temperature and contrast choices.
- Type scale, spacing (base unit + full scale), radii, shadows, and motion (durations, one named easing curve, principles) must be internally consistent — spacing steps derived from the base unit, radii and shadows matching the brand's softness/sharpness.
- componentGuidelines: per-component guidance concrete enough to build from (buttons, inputs, cards, nav at minimum).
- rationale: why these choices express the personality, in a short paragraph.
- Provided MEMORY CONTEXT may inform choices; when empty, work from expert knowledge alone.`;

export async function generateDesignSystem(input: {
  brandPersonality: string;
  industry: string;
  inspiration?: string[];
}): Promise<DesignSystemSpec> {
  const { brandPersonality, industry, inspiration } = input;

  const hits = await searchMemorySafe(
    [brandPersonality, industry, ...(inspiration ?? [])].join(" "),
    { industry, limit: 6 },
  );

  const user = [
    `Generate a design system for:`,
    `- brandPersonality: ${brandPersonality}`,
    `- industry: ${industry}`,
    `- inspiration: ${inspiration && inspiration.length > 0 ? inspiration.join("; ") : "none given"}`,
    ``,
    `MEMORY CONTEXT (one JSON object per line):`,
    serializeHits(hits),
  ].join("\n");

  return completeJSON({
    system: DESIGN_SYSTEM_SYSTEM_PROMPT,
    messages: [{ role: "user", content: user }],
    schema: DesignSystemSpecSchema,
  });
}
