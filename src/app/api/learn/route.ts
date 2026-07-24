import { z } from "zod/v4";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { learn } from "@/lib/engines/learning";
import { LearnInputSchema } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();

  let input: z.infer<typeof LearnInputSchema>;
  try {
    input = LearnInputSchema.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ")
        : "Invalid JSON body.";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    const result = await learn(input);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
