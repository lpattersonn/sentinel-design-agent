import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designScores, type DesignScoreRow } from "@/lib/db/schema";
import {
  DIMENSIONS,
  EmptySheet,
  Meter,
  PageHeader,
  ScoreGlyph,
  SetupSheet,
  dimEntry,
  fmtDate,
  improvementsOf,
  verdictOf,
} from "@/components/sheet";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Scores" };

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

export default async function ScoresPage() {
  const rows = await loadScores();

  return (
    <div>
      <PageHeader
        eyebrow="Eleven-dimension critique"
        sheet="SHT 04 · CRITIQUE"
        title="Scores"
        meta={rows ? `${rows.length} RECORDED` : undefined}
      />

      {!rows ? (
        <SetupSheet />
      ) : rows.length === 0 ? (
        <EmptySheet title="No scores yet">
          <p>
            Call <code className="codechip">score_design</code> over MCP with a
            URL, HTML, or description to record the first eleven-dimension
            critique.
          </p>
        </EmptySheet>
      ) : (
        <>
          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
            {DIMENSIONS.map((d) => (
              <span key={d.key} className="font-mono text-[10px] text-faint">
                <span className="text-dim">{d.abbr}</span> {d.label}
              </span>
            ))}
          </p>

          <ul className="mt-6 space-y-3">
            {rows.map((row) => {
              const verdict = verdictOf(row.scores);
              const improvements = improvementsOf(row.scores);
              return (
                <li key={row.id}>
                  <details className="scorerow">
                    <summary className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5 sm:grid-cols-[64px_1fr_auto_auto] sm:gap-5">
                      <span
                        className="block"
                        title={`Overall ${row.overall}/100`}
                      >
                        <span className="block font-display text-[38px] font-semibold leading-none text-ink num">
                          {row.overall}
                        </span>
                        <span className="mt-1 block font-mono text-[9px] tracking-[0.2em] text-faint">
                          OVERALL
                        </span>
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[15px] text-ink">
                          {row.target}
                        </span>
                        {verdict && (
                          <span className="mt-0.5 block truncate text-[13px] italic leading-relaxed text-dim">
                            {verdict}
                          </span>
                        )}
                        <span className="mt-1 block font-mono text-[10px] text-faint num">
                          {fmtDate(row.createdAt)}
                        </span>
                      </span>

                      <span className="hidden sm:block">
                        <ScoreGlyph scores={row.scores} />
                      </span>

                      <span className="indicator" aria-hidden="true" />
                    </summary>

                    <div className="p-5 md:p-6">
                      <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
                        {DIMENSIONS.map((d) => {
                          const e = dimEntry(row.scores, d.key);
                          return (
                            <div key={d.key}>
                              <div className="flex items-baseline justify-between gap-4">
                                <span className="font-mono text-[10px] tracking-[0.14em] text-faint">
                                  <span className="text-trace">{d.abbr}</span>{" "}
                                  {d.label.toUpperCase()}
                                </span>
                                <span className="font-mono text-[12px] text-ink num">
                                  {e ? e.score : "—"}
                                </span>
                              </div>
                              <div className="mt-1.5">
                                {e ? (
                                  <Meter value={e.score} />
                                ) : (
                                  <span
                                    className="meter w-full"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              {e?.reasoning && (
                                <p className="mt-1.5 text-[13px] leading-relaxed text-dim">
                                  {e.reasoning}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {verdict && (
                        <div className="mt-7 border-t border-line pt-5">
                          <p className="eyebrow">Verdict</p>
                          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink">
                            {verdict}
                          </p>
                        </div>
                      )}

                      {improvements.length > 0 && (
                        <div className="mt-6">
                          <p className="eyebrow text-redline">
                            Top improvements — ordered by impact
                          </p>
                          <ol className="mt-3 space-y-2">
                            {improvements.map((t, i) => (
                              <li
                                key={t}
                                className="flex gap-3 text-[14px] leading-relaxed text-dim"
                              >
                                <span className="shrink-0 font-mono text-[11px] leading-[1.6] text-faint num">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="min-w-0">{t}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
