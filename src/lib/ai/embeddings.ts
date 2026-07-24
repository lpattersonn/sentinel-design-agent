export const EMBEDDING_DIM = 1536;
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBED_TIMEOUT_MS = 12_000;

/**
 * Embed texts with OpenAI text-embedding-3-small (1536 dimensions).
 * Returns null when OPENAI_API_KEY is not configured, or on timeout/network
 * error — callers must fall back to keyword search. Retrieval degrades
 * gracefully; nothing hard-fails.
 */
export async function embed(texts: string[]): Promise<number[][] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || texts.length === 0) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts.map((t) => t.slice(0, 20000)),
      }),
    });

    if (!res.ok) {
      console.error(`Embedding request failed (${res.status}): ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as { data: { index: number; embedding: number[] }[] };
    return data.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  } catch (err) {
    console.error("Embedding request failed:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function embedOne(text: string): Promise<number[] | null> {
  const result = await embed([text]);
  return result?.[0] ?? null;
}
