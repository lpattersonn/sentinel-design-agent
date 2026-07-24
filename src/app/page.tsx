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
import {
  PageHeader,
  PaletteSpine,
  ScoreGlyph,
  SetupSheet,
  fmtDate,
  paletteOf,
} from "@/components/sheet";

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
    analysis: unknown;
    createdAt: Date;
  }[];
  recentScores: {
    id: string;
    target: string;
    overall: number;
    scores: unknown;
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
            analysis: designMemories.analysis,
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
            scores: designScores.scores,
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
  "save_design_analysis",
  "save_design_score",
  "save_insight",
];

export default async function OverviewPage() {
  const data = await loadOverview();

  const brainEnv = process.env.SENTINEL_BRAIN;
  const brain =
    brainEnv === "server" || brainEnv === "client"
      ? brainEnv
      : process.env.ANTHROPIC_API_KEY
        ? "server"
        : "client";
  const statusChips = [
    brain === "server"
      ? `brain · server (${process.env.SENTINEL_MODEL || "claude-opus-4-8"})`
      : "brain · client (agent model)",
    process.env.OPENAI_API_KEY
      ? "retrieval · vector"
      : "retrieval · keyword fallback",
    process.env.SENTINEL_API_KEY ? "api · keyed" : "api · open (dev)",
  ];

  const cells = data
    ? ([
        { label: "MEMORIES", value: data.counts.memories, href: "/memories" },
        { label: "PATTERNS", value: data.counts.patterns, href: "/patterns" },
        { label: "SCORES", value: data.counts.scores, href: "/scores" },
        { label: "INSIGHTS", value: data.counts.insights, href: null },
        { label: "FEEDBACK", value: data.counts.feedback, href: null },
      ] as const)
    : null;

  return (
    <div>
      <PageHeader
        eyebrow="Control room"
        sheet="SHT 01 · SENTINEL DRAWING SET"
        title="Overview"
      />

      <p className="mt-8 max-w-3xl text-[17px] leading-relaxed text-dim md:text-[18px]">
        Sentinel reads world-class design and files what it learns. Every
        analyzed page becomes a structured{" "}
        <Link
          href="/memories"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-trace"
        >
          memory
        </Link>
        ; recurring moves are curated into{" "}
        <Link
          href="/patterns"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-trace"
        >
          patterns
        </Link>
        ; finished work is measured across{" "}
        <Link
          href="/scores"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-trace"
        >
          eleven dimensions
        </Link>
        ; and project feedback is distilled into insights that sharpen every
        future build prompt.
      </p>

      {!data || !cells ? (
        <SetupSheet />
      ) : (
        <>
          <section
            aria-label="Archive counts"
            className="mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5"
          >
            {cells.map((c) =>
              c.href ? (
                <Link
                  key={c.label}
                  href={c.href}
                  className="group bg-panel px-4 py-5 transition-colors hover:bg-raised"
                >
                  <p className="font-mono text-[10px] tracking-[0.2em] text-faint">
                    {c.label}
                  </p>
                  <p className="mt-2 font-display text-[44px] font-semibold leading-none text-ink num transition-colors group-hover:text-trace">
                    {c.value}
                  </p>
                </Link>
              ) : (
                <div
                  key={c.label}
                  className={`bg-panel px-4 py-5 ${
                    c.label === "FEEDBACK"
                      ? "col-span-2 sm:col-span-2 lg:col-span-1"
                      : ""
                  }`}
                >
                  <p className="font-mono text-[10px] tracking-[0.2em] text-faint">
                    {c.label}
                  </p>
                  <p className="mt-2 font-display text-[44px] font-semibold leading-none text-ink num">
                    {c.value}
                  </p>
                </div>
              ),
            )}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="border border-line bg-panel p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="eyebrow">Latest memories</h2>
                <Link
                  href="/memories"
                  className="font-mono text-[10px] tracking-[0.16em] text-faint transition-colors hover:text-trace"
                >
                  SHT 02 →
                </Link>
              </div>
              {data.recentMemories.length === 0 ? (
                <p className="mt-5 text-[14px] leading-relaxed text-dim">
                  Nothing analyzed yet. Call{" "}
                  <code className="codechip">analyze_design</code> over MCP or
                  run <code className="codechip">npm run seed</code>.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {data.recentMemories.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/memories/${m.id}`}
                        className="group block py-3"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="min-w-0 truncate font-display text-[16px] font-semibold uppercase tracking-[0.02em] text-ink transition-colors group-hover:text-trace">
                            {m.title}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-faint num">
                            {fmtDate(m.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-4">
                          <span className="truncate font-mono text-[10.5px] text-faint">
                            {m.industry ?? "—"}
                          </span>
                          <PaletteSpine palette={paletteOf(m.analysis)} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-line bg-panel p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="eyebrow">Latest scores</h2>
                <Link
                  href="/scores"
                  className="font-mono text-[10px] tracking-[0.16em] text-faint transition-colors hover:text-trace"
                >
                  SHT 04 →
                </Link>
              </div>
              {data.recentScores.length === 0 ? (
                <p className="mt-5 text-[14px] leading-relaxed text-dim">
                  No designs measured yet. Call{" "}
                  <code className="codechip">score_design</code> with a URL,
                  HTML, or description.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {data.recentScores.map((s) => (
                    <li key={s.id} className="flex items-center gap-4 py-3">
                      <span
                        className="w-12 shrink-0 font-display text-[26px] font-semibold leading-none text-ink num"
                        title={`Overall ${s.overall}/100`}
                      >
                        {s.overall}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-ink">
                          {s.target}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] text-faint num">
                          {fmtDate(s.createdAt)}
                        </span>
                      </span>
                      <span className="hidden sm:block">
                        <ScoreGlyph scores={s.scores} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}

      <section className="mt-10 border border-line bg-panel">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
          <h2 className="eyebrow text-trace">MCP endpoint</h2>
          <p className="font-mono text-[10px] tracking-[0.12em] text-faint">
            STREAMABLE HTTP · AUTHORIZATION: BEARER SENTINEL_API_KEY
          </p>
        </div>
        <div className="px-5 py-5 md:px-6 md:py-6">
          <p>
            <code className="codechip text-[13px]">/mcp</code>
            <span className="ml-3 font-mono text-[11px] text-faint">
              alias of /api/mcp
            </span>
          </p>
          <p className="mt-5 font-mono text-[10px] tracking-[0.2em] text-faint">
            TOOLS
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
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
        </div>
      </section>
    </div>
  );
}
