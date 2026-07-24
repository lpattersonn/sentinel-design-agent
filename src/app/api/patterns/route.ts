import { z } from "zod/v4";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { findPatterns, upsertPattern } from "@/lib/engines/patterns";

export const dynamic = "force-dynamic";

const PatternUpsertSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  whyItWorks: z.string().min(1),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  idealUseCases: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  complexity: z.number().int().min(1).max(5).optional(),
  conversionScore: z.number().int().min(0).max(100).optional(),
  spec: z.record(z.string(), z.unknown()).optional(),
  source: z.string().optional(),
});

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const params = new URL(req.url).searchParams;
    const rawLimit = Number(params.get("limit"));
    const rows = await findPatterns({
      category: params.get("category") ?? undefined,
      industry: params.get("industry") ?? undefined,
      query: params.get("query") ?? undefined,
      limit: Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : undefined,
    });
    return Response.json({ patterns: rows });
  } catch (err) {
    return Response.json({ error: errorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const parsed = PatternUpsertSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid pattern payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const row = await upsertPattern(parsed.data);
    return Response.json({ pattern: row });
  } catch (err) {
    return Response.json({ error: errorMessage(err) }, { status: 500 });
  }
}
