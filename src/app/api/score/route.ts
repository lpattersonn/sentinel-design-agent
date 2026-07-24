import { z } from "zod/v4";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { scoreDesign } from "@/lib/engines/scorer";

export const dynamic = "force-dynamic";

const ScoreRequestSchema = z
  .object({
    html: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
    context: z.string().optional(),
    projectId: z.string().optional(),
  })
  .refine((v) => Boolean(v.html || v.url || v.description), {
    message: "Provide at least one of html, url or description.",
  });

export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();

  let input: z.infer<typeof ScoreRequestSchema>;
  try {
    input = ScoreRequestSchema.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ")
        : "Invalid JSON body.";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    const result = await scoreDesign(input);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
