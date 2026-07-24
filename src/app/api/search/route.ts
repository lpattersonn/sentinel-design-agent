import { isAuthorized, unauthorized } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { searchMemory } from "@/lib/engines/retrieval";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  { const limited = await enforceRateLimit(req); if (limited) return limited; }
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return Response.json(
        { error: "Missing required query parameter: q" },
        { status: 400 },
      );
    }
    const industry = searchParams.get("industry") ?? undefined;
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
    const hits = await searchMemory(q, { industry, limit });
    return Response.json({ hits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
