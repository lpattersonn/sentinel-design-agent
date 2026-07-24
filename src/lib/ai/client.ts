import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod/v4";

export const MODEL = process.env.SENTINEL_MODEL || "claude-opus-4-8";

let _client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set.");
    }
    _client = new Anthropic();
  }
  return _client;
}

/**
 * Run a Claude request whose response is validated against a Zod schema
 * (structured outputs). Throws on refusal or parse failure.
 */
export async function completeJSON<S extends z.ZodType>(opts: {
  system?: string;
  messages: Anthropic.MessageParam[];
  schema: S;
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 16000,
    thinking: { type: "adaptive" },
    ...(opts.system ? { system: opts.system } : {}),
    messages: opts.messages,
    output_config: { format: zodOutputFormat(opts.schema) },
  });
  if (response.stop_reason === "refusal") {
    throw new Error("The model declined this request.");
  }
  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Model output did not match the expected schema.");
  }
  return parsed as z.infer<S>;
}

/** Plain-text Claude completion. */
export async function completeText(opts: {
  system?: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
}): Promise<string> {
  const response = await anthropic().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 16000,
    thinking: { type: "adaptive" },
    ...(opts.system ? { system: opts.system } : {}),
    messages: opts.messages,
  });
  if (response.stop_reason === "refusal") {
    throw new Error("The model declined this request.");
  }
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}
