import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  designMemories,
  designScores,
  feedbackEvents,
  insights,
  patterns,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type Overview = {
  counts: {
    memories: number;
    patterns: number;
    scores: number;
    insights: number;
    feedback: number;
  };
  recentMemories: {
    id: string;
    title: string;
    industry: string | null;
    traits: string[];
    createdAt: Date;
  }[];
  recentScores: {
    id: string;
    target: string;
    overall: number;
    createdAt: Date;
  }[];
};

async function loadOverview(): Promise<Overview | null> {
  try {
    const db = getDb();
    const [mem, pat, sco, ins, fee, recentMemories, recentScores] =
      await Promise.all([
        db.select({ n: count() }).from(designMemories),
        db.select({ n: count() }).from(patterns),
        db.select({ n: count() }).from(designScores),
        db.select({ n: count() }).from(insights),
        db.select({ n: count() }).from(feedbackEvents),
        db
          .select({
            id: designMemories.id,
            title: designMemories.title,
            industry: designMemories.industry,
            traits: designMemories.traits,
            createdAt: designMemories.createdAt,
          })
          .from(designMemories)
          .orderBy(desc(designMemories.createdAt))
          .limit(5),
        db
          .select({
            id: designScores.id,
            target: designScores.target,
            overall: designScores.overall,
            createdAt: designScores.createdAt,
          })
          .from(designScores)
          .orderBy(desc(designScores.createdAt))
          .limit(5),
      ]);
    return {
      counts: {
        memories: mem[0]?.n ?? 0,
        patterns: pat[0]?.n ?? 0,
        scores: sco[0]?.n ?? 0,
        insights: ins[0]?.n ?? 0,
        feedback: fee[0]?.n ?? 0,
      },
      recentMemories,
      recentScores,
    };
  } catch {
    return null;
  }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
        Postgres (transaction pooler, port 6543), run the migrations, then seed
        the starter library of patterns and reference memories.
      </p>
      <ol className="mt-5 space-y-2 font-mono text-xs text-dim">
        <li>
          <span className="mr-3 text-faint">01</span>set DATABASE_URL in .env
        </li>
        <li>
          <span className="mr-3 text-faint">02</span>npm run db:migrate
        </li>
        <li>
          <span className="mr-3 text-faint">03</span>npm run seed
        </li>
      </ol>
    </div>
  );
}

const MCP_TOOLS = [
  "analyze_design",
  "find_patterns",
  "retrieve_best_practices",
  "score_design",
  "improve_prompt",
  "learn",
  "search_memory",
  "suggest_layout",
  "generate_design_system",
];

export default async function OverviewPage() {
  const data = await loadOverview();

  const statusChips = [
    `model · ${process.env.SENTINEL_MODEL || "claude-opus-4-8"}`,
    process.env.OPENAI_API_KEY
      ? "retrieval · vector"
      : "retrieval · keyword fallback",
    process.env.SENTINEL_API_KEY ? "api · keyed" : "api · open (dev)",
  ];

  return (
    <div>
      <header>
        <p className="eyebrow">Control room</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">
          Overview
        </h1>
        <div className="titlerule" />
      </header>

      {!data ? (
        <SetupCard />
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(
              [
                ["Memories", data.counts.memories],
                ["Patterns", data.counts.patterns],
                ["Scores", data.counts.scores],
                ["Insights", data.counts.insights],
                ["Feedback", data.counts.feedback],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="panel px-4 py-4">
                <p className="font-mono text-[10px] tracking-[0.18em] text-faint">
                  {label.toUpperCase()}
                </p>
                <p className="mt-2 font-display text-4xl leading-none text-ink">
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="panel p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="eyebrow">Latest memories</h2>
                <Link
                  href="/memories"
                  className="font-mono text-[11px] text-faint transition-colors hover:text-amber"
                >
                  ALL →
                </Link>
              </div>
              {data.recentMemories.length === 0 ? (
                <p className="mt-5 text-sm text-dim">
                  Nothing analyzed yet. Call{" "}
                  <span className="codechip">analyze_design</span> over MCP or
                  run <span className="codechip">npm run seed</span>.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {data.recentMemories.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/memories/${m.id}`}
                        className="group block py-3"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="truncate font-display text-[17px] text-ink transition-colors group-hover:text-amber">
                            {m.title}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-faint">
                            {fmtDate(m.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 truncate font-mono text-[11px] text-dim">
                          {[m.industry, m.traits.slice(0, 3).join(" · ")]
                            .filter(Boolean)
                            .join("  ·  ") || "—"}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="panel p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="eyebrow">Latest scores</h2>
                <Link
                  href="/scores"
                  className="font-mono text-[11px] text-faint transition-colors hover:text-amber"
                >
                  ALL →
                </Link>
              </div>
              {data.recentScores.length === 0 ? (
                <p className="mt-5 text-sm text-dim">
                  No designs scored yet. Call{" "}
                  <span className="codechip">score_design</span> with a URL,
                  HTML, or description.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {data.recentScores.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-4 py-3"
                    >
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-edge font-display text-lg text-ink"
                        title={`Overall ${s.overall}/100`}
                      >
                        {s.overall}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">
                          {s.target}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] text-faint">
                          {fmtDate(s.createdAt)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}

      <section className="panel mt-8 p-6 md:p-8">
        <p className="eyebrow text-amber">What Sentinel is</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">
          Sentinel is a design-intelligence brain for Claude Code. It analyzes
          world-class designs into structured{" "}
          <Link href="/memories" className="text-ink underline decoration-line underline-offset-4 hover:decoration-amber">
            memories
          </Link>
          , curates reusable{" "}
          <Link href="/patterns" className="text-ink underline decoration-line underline-offset-4 hover:decoration-amber">
            patterns
          </Link>
          , scores work across eleven{" "}
          <Link href="/scores" className="text-ink underline decoration-line underline-offset-4 hover:decoration-amber">
            dimensions
          </Link>
          , and distills project feedback into insights — then feeds all of it
          back into every build prompt.
        </p>
        <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-faint">
          MCP ENDPOINT
        </p>
        <p className="mt-2">
          <span className="codechip">/api/mcp</span>
          <span className="ml-3 font-mono text-[11px] text-faint">
            streamable HTTP · Authorization: Bearer SENTINEL_API_KEY
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {MCP_TOOLS.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">
          {statusChips.map((c) => (
            <span key={c} className="chip text-faint">
              {c}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
