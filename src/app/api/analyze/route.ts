import { analyzeDesign } from "@/lib/engines/analyzer";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { AnalyzeInputSchema } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = AnalyzeInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeDesign(parsed.data);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Design analysis failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
