import { z } from "zod/v4";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { retrieveBestPractices } from "@/lib/engines/bestPractices";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  pageType: z.string().trim().min(1),
  industry: z.string().optional(),
  brandPersonality: z.string().optional(),
  goals: z.array(z.string()).optional(),
});

export async function POST(req: Request): Promise<Response> {
  if (!isAuthorized(req)) return unauthorized();

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ")
        : "Invalid JSON body.";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    const bundle = await retrieveBestPractices(body);
    return Response.json(bundle);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to assemble best practices.";
    return Response.json({ error: message }, { status: 500 });
  }
}
