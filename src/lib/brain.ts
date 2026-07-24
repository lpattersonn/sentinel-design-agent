/**
 * Sentinel has two brains:
 *
 * - "server": Sentinel calls the Anthropic API itself (needs ANTHROPIC_API_KEY).
 *   Tools return finished results.
 * - "client": the connected agent's own model does the thinking. LLM-powered
 *   tools return a *brief* (prepared source material + instructions + a JSON
 *   schema); the agent completes the work and persists results via the
 *   save_design_analysis / save_design_score / save_insight tools.
 *
 * SENTINEL_BRAIN selects the mode: "server" | "client" | "auto" (default).
 * "auto" uses the server brain when ANTHROPIC_API_KEY is set, else client.
 */
export type BrainMode = "server" | "client";

export function brainMode(): BrainMode {
  const raw = (process.env.SENTINEL_BRAIN ?? "auto").trim().toLowerCase();
  if (raw === "server") return "server";
  if (raw === "client") return "client";
  return process.env.ANTHROPIC_API_KEY ? "server" : "client";
}
