import { z } from "zod/v4";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { improvePrompt } from "@/lib/engines/promptBuilder";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  prompt: z.string().trim().min(1, "prompt must be non-empty"),
  pageType: z.string().optional(),
  industry: z.string().optional(),
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
    const enhancement = await improvePrompt(body);
    return Response.json(enhancement);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to improve prompt.";
    return Response.json({ error: message }, { status: 500 });
  }
}
