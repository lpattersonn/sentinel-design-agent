import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designScores, type DesignScoreRow } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Scores" };

const DIMENSIONS = [
  { key: "visualHierarchy", abbr: "HIER", label: "Visual hierarchy" },
  { key: "accessibility", abbr: "A11Y", label: "Accessibility" },
  { key: "spacing", abbr: "SPACE", label: "Spacing" },
  { key: "consistency", abbr: "CONS", label: "Consistency" },
  { key: "readability", abbr: "READ", label: "Readability" },
  { key: "conversion", abbr: "CONV", label: "Conversion" },
  { key: "mobile", abbr: "MOB", label: "Mobile" },
  { key: "performance", abbr: "PERF", label: "Performance" },
  { key: "modernDesign", abbr: "MOD", label: "Modern design" },
  { key: "animation", abbr: "ANIM", label: "Animation" },
  { key: "componentQuality", abbr: "COMP", label: "Component quality" },
] as const;

async function loadScores(): Promise<DesignScoreRow[] | null> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(designScores)
      .orderBy(desc(designScores.createdAt))
      .limit(50);
  } catch {
    return null;
  }
}

function dimScore(scores: unknown, key: string): number | null {
  if (typeof scores !== "object" || scores === null) return null;
  const dim = (scores as Record<string, unknown>)[key];
  if (typeof dim !== "object" || dim === null) return null;
  const value = (dim as { score?: unknown }).score;
  return typeof value === "number" ? Math.min(100, Math.max(0, value)) : null;
}

function verdictOf(scores: unknown): string {
  if (typeof scores !== "object" || scores === null) return "";
  const v = (scores as { verdict?: unknown }).verdict;
  return typeof v === "string" ? v : "";
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DimensionBars({ scores }: { scores: unknown }) {
  const summary = DIMENSIONS.map((d) => {
    const value = dimScore(scores, d.key);
    return `${d.label} ${value === null ? "not scored" : `${value} of 100`}`;
  }).join(", ");
  return (
    <div className="flex items-end gap-[3px]" role="img" aria-label={summary}>
      {DIMENSIONS.map((d) => {
        const value = dimScore(scores, d.key);
        const height = value === null ? 0 : Math.max(2, Math.round((value / 100) * 30));
        return (
          <span
            key={d.key}
            className="relative block h-[30px] w-[7px] overflow-hidden rounded-[2px] bg-raised"
            title={value === null ? `${d.label} — not scored` : `${d.label} ${value}/100`}
          >
            {value !== null && (
              <span
                className="absolute inset-x-0 bottom-0 block rounded-t-[2px] bg-amber"
                style={{ height: `${height}px` }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function SetupCard() {
  return (
    <div className="panel mt-8 max-w-xl p-8">
      <p className="eyebrow text-amber">Awaiting connection</p>
      <h2 className="mt-3 font-display text-2xl text-ink">
        Sentinel is not connected to a database yet
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-dim">
        Point <span className="codechip">DATABASE_URL</span> at your Supabase
        Postgres (transaction pooler, port 6543), then run{" "}
        <span className="codechip">npm run db:migrate</span> and{" "}
        <span className="codechip">npm run seed</span>.
      </p>
    </div>
  );
}

export default async function ScoresPage() {
  const rows = await loadScores();

  return (
    <div>
      <header>
        <p className="eyebrow">Eleven-dimension critique</p>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl tracking-tight text-ink">
            Scores
          </h1>
          {rows && (
            <span className="font-mono text-[11px] text-faint">
              {rows.length} RECORDED
            </span>
          )}
        </div>
        <div className="titlerule" />
      </header>

      {!rows ? (
        <SetupCard />
      ) : rows.length === 0 ? (
        <div className="panel mt-8 max-w-xl p-8">
          <h2 className="font-display text-xl text-ink">No scores yet</h2>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            Call <span className="codechip">score_design</span> over MCP with a
            URL, HTML, or description to record the first eleven-dimension
            critique.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
            {DIMENSIONS.map((d) => (
              <span key={d.key} className="font-mono text-[10px] text-faint">
                <span className="text-dim">{d.abbr}</span> {d.label}
              </span>
            ))}
          </div>

          <ul className="mt-6 space-y-3">
            {rows.map((row) => {
              const verdict = verdictOf(row.scores);
              return (
                <li
                  key={row.id}
                  className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div
                    className="flex shrink-0 items-center gap-4 sm:w-24 sm:flex-col sm:items-start sm:gap-1"
                    title={`Overall ${row.overall}/100`}
                  >
                    <span className="font-display text-4xl leading-none text-ink">
                      {row.overall}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.18em] text-faint">
                      OVERALL
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{row.target}</p>
                    {verdict && (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-dim">
                        {verdict}
                      </p>
                    )}
                    <p className="mt-1.5 font-mono text-[10px] text-faint">
                      {fmtDate(row.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 sm:pl-2">
                    <DimensionBars scores={row.scores} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
