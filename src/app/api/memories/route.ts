import { isAuthorized, unauthorized } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { listMemories } from "@/lib/engines/memory";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  { const limited = await enforceRateLimit(req); if (limited) return limited; }
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") ?? undefined;
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
    const memories = await listMemories({ industry, limit });
    return Response.json({ memories });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list memories.";
    return Response.json({ error: message }, { status: 500 });
  }
}
