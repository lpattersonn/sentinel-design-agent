import { brainMode } from "@/lib/brain";
import { isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const brain = brainMode();
  return Response.json({
    ok: true,
    service: "sentinel",
    db: isDbConfigured() ? "configured" : "not configured",
    brain,
    model: brain === "server" ? process.env.SENTINEL_MODEL || "claude-opus-4-8" : "connected agent",
    embeddings: process.env.OPENAI_API_KEY ? "vector" : "keyword-fallback",
  });
}
