import type Anthropic from "@anthropic-ai/sdk";
import { completeJSON } from "@/lib/ai/client";
import { embedOne } from "@/lib/ai/embeddings";
import { isDbConfigured } from "@/lib/db";
import { normalizeIndustry } from "@/lib/normalize";
import { saveMemory } from "@/lib/engines/memory";
import { fetchPublic } from "@/lib/safeFetch";
import type { NewDesignMemory } from "@/lib/db/schema";
import {
  DesignAnalysisSchema,
  type AnalyzeInput,
  type AnalyzeResult,
  type DesignAnalysis,
} from "@/lib/types";

const MAX_STRUCTURAL_HTML_CHARS = 50_000;
const MAX_VISIBLE_TEXT_CHARS = 8_000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const SYSTEM_PROMPT = `You are a world-class design director who extracts structured, transferable design knowledge from designs.

From the provided source (HTML, visible text, a screenshot, a link, or a written description), produce a rigorous analysis covering: the spacing system (base unit, vertical rhythm between sections), the type scale and hierarchy, grid and container, how the eye moves through the page, the color palette with the role each color plays, component patterns with a clear account of why each one works, animation, accessibility, responsiveness, short memorable traits, and transferable lessons.

Rules:
- Be concrete and opinionated. Name the pattern, say why it works, and state what is worth copying.
- Never fabricate pixel values, font names, or hex codes you cannot actually infer from the source — use null for numeric fields and say what you are unsure of in the notes.
- Traits are short and memorable, e.g. "large typography", "strong whitespace".
- Lessons are transferable directives another designer (or an AI building a page) should apply elsewhere, not passive observations.
- If the source is limited (e.g. a link that could not be inspected), state that limitation explicitly in the summary and notes and keep claims conservative.`;

const IMAGE_MEDIA_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
type ImageMediaType = (typeof IMAGE_MEDIA_TYPES)[number];

const IMAGE_URL_RE = /\.(png|jpe?g|gif|webp)(\?.*)?$/i;

const FETCH_HEADERS: Record<string, string> = {
  "user-agent":
    "Mozilla/5.0 (compatible; SentinelDesignAgent/1.0; design-analysis)",
  accept: "text/html,application/xhtml+xml,image/*;q=0.9,*/*;q=0.8",
};

/** Remove script/style/svg bodies and comments; truncate to a model-friendly size. */
function stripHtml(html: string): string {
  const stripped = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  return stripped.slice(0, MAX_STRUCTURAL_HTML_CHARS);
}

/** Crude visible-text extraction: drop tags, decode common entities, collapse whitespace. */
function extractVisibleText(html: string): string {
  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&(#39|apos);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, MAX_VISIBLE_TEXT_CHARS);
}

function normalizeMediaType(raw: string | null | undefined): ImageMediaType {
  const lowered = (raw ?? "").toLowerCase().split(";")[0]?.trim() ?? "";
  const mapped = lowered === "image/jpg" ? "image/jpeg" : lowered;
  return (IMAGE_MEDIA_TYPES as readonly string[]).includes(mapped)
    ? (mapped as ImageMediaType)
    : "image/png";
}

/** Determine the media type from the decoded magic bytes — never trust the label. */
function sniffImageMediaType(base64: string): ImageMediaType {
  const bytes = Buffer.from(base64.slice(0, 24), "base64");
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  throw new Error(
    "Unrecognized image format — the screenshot must be a base64-encoded PNG, JPEG, GIF or WEBP image.",
  );
}

/** Accept a raw base64 string or a data: URI; return clean base64 + sniffed media type. */
function parseBase64Image(content: string): { data: string; mediaType: ImageMediaType } {
  const trimmed = content.trim();
  const match = /^data:([a-z0-9/+.-]+);base64,/i.exec(trimmed);
  const data = (match ? trimmed.slice(match[0].length) : trimmed).replace(/\s+/g, "");
  return { data, mediaType: sniffImageMediaType(data) };
}

/** Fetch a remote image and base64-encode it; null on failure or oversize (~4MB cap). */
async function tryFetchImage(
  url: string,
): Promise<{ data: string; mediaType: ImageMediaType } | null> {
  try {
    const res = await fetchPublic(url, { headers: FETCH_HEADERS });
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) return null;
    return {
      data: Buffer.from(buf).toString("base64"),
      mediaType: normalizeMediaType(res.headers.get("content-type")),
    };
  } catch {
    return null;
  }
}

function contextLines(input: AnalyzeInput): string {
  const lines: string[] = [];
  if (input.title) lines.push(`Title: ${input.title}`);
  if (input.brand) lines.push(`Brand: ${input.brand}`);
  if (input.industry) lines.push(`Industry: ${input.industry}`);
  if (input.tags?.length) lines.push(`Tags: ${input.tags.join(", ")}`);
  return lines.length > 0
    ? `Context provided by the requester:\n${lines.join("\n")}`
    : "";
}

function htmlSourceText(intro: string, html: string, context: string): string {
  const parts = [
    intro,
    context,
    "=== STRUCTURAL HTML (scripts/styles/svg stripped, truncated) ===",
    stripHtml(html),
    "=== VISIBLE TEXT (truncated) ===",
    extractVisibleText(html),
  ];
  return parts.filter(Boolean).join("\n\n");
}

function imageMessage(
  image: { data: string; mediaType: ImageMediaType },
  instructions: string,
): Anthropic.MessageParam[] {
  return [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.mediaType,
            data: image.data,
          },
        },
        { type: "text", text: instructions },
      ],
    },
  ];
}

function textMessage(text: string): Anthropic.MessageParam[] {
  return [{ role: "user", content: text }];
}

async function buildMessages(input: AnalyzeInput): Promise<Anthropic.MessageParam[]> {
  const context = contextLines(input);

  switch (input.sourceType) {
    case "url": {
      const res = await fetchPublic(input.content, { headers: FETCH_HEADERS });
      const html = await res.text();
      return textMessage(
        htmlSourceText(
          `Analyze the design of the page at ${input.content}.`,
          html,
          context,
        ),
      );
    }

    case "html":
      return textMessage(
        htmlSourceText("Analyze the design of the following HTML source.", input.content, context),
      );

    case "screenshot":
      return imageMessage(
        parseBase64Image(input.content),
        ["Analyze the design shown in this screenshot.", context]
          .filter(Boolean)
          .join("\n\n"),
      );

    case "figma": {
      if (IMAGE_URL_RE.test(input.content.trim())) {
        const image = await tryFetchImage(input.content.trim());
        if (image) {
          return imageMessage(
            image,
            [
              "Analyze the design shown in this exported Figma image.",
              context,
            ]
              .filter(Boolean)
              .join("\n\n"),
          );
        }
      }
      // v1 cannot call the Figma API and the link is not a fetchable image.
      return textMessage(
        [
          "Analyze this design based on a Figma link and the context below. The Figma API is not available in this version, so the file contents could not be inspected — reason only from the link and context, keep concrete claims conservative, use null for any value you cannot infer, and explicitly note this limitation in the summary and notes fields.",
          `Figma link: ${input.content}`,
          context,
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
    }

    case "description":
      return textMessage(
        [
          "Analyze the design described below. Where the description is silent, use null rather than inventing values.",
          context,
          `=== DESCRIPTION ===\n${input.content}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
  }
}

function sourceLabel(input: AnalyzeInput): string {
  switch (input.sourceType) {
    case "url":
      try {
        return new URL(input.content).hostname;
      } catch {
        return "web page";
      }
    case "figma":
      return "Figma file";
    case "screenshot":
      return "screenshot";
    case "html":
      return "HTML source";
    case "description":
      return "described design";
  }
}

function deriveTitle(input: AnalyzeInput, analysis: DesignAnalysis): string {
  return `${analysis.style} — ${sourceLabel(input)}`;
}

export async function analyzeDesign(input: AnalyzeInput): Promise<AnalyzeResult> {
  if (!isDbConfigured()) {
    throw new Error(
      "DATABASE_URL is not set — analysis would be computed but could not be saved. Configure Supabase first.",
    );
  }

  const messages = await buildMessages(input);

  const analysis = await completeJSON({
    system: SYSTEM_PROMPT,
    messages,
    schema: DesignAnalysisSchema,
  });

  const embedding = await embedOne(
    `${analysis.summary} ${analysis.traits.join(", ")} ${analysis.style}`,
  );

  const row: NewDesignMemory = {
    title: input.title ?? deriveTitle(input, analysis),
    sourceType: input.sourceType,
    sourceRef:
      input.sourceType === "url" || input.sourceType === "figma"
        ? input.content
        : null,
    industry: normalizeIndustry(input.industry ?? analysis.industry),
    brand: input.brand ?? null,
    tags: input.tags ?? [],
    analysis,
    summary: analysis.summary,
    traits: analysis.traits,
    embedding,
  };

  const saved = await saveMemory(row);
  return { memoryId: saved.id, analysis };
}
