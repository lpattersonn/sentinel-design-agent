import { isAuthorized, unauthorized } from "@/lib/auth";
import { getMemory } from "@/lib/engines/memory";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { id } = await params;
    const memory = await getMemory(id);
    if (!memory) {
      return Response.json({ error: "Memory not found." }, { status: 404 });
    }
    return Response.json({ memory });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load memory.";
    return Response.json({ error: message }, { status: 500 });
  }
}
