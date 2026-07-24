import { isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "sentinel",
    db: isDbConfigured() ? "configured" : "not configured",
    model: process.env.SENTINEL_MODEL || "claude-opus-4-8",
    embeddings: process.env.OPENAI_API_KEY ? "vector" : "keyword-fallback",
  });
}
