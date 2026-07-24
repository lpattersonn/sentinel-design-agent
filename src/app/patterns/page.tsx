import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { patterns } from "@/lib/db/schema";
import {
  EmptySheet,
  Meter,
  PageHeader,
  SetupSheet,
  TickScale,
} from "@/components/sheet";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Patterns" };

type PatternListItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity: number;
  conversionScore: number;
};

const CATEGORY_ORDER = [
  "hero",
  "navigation",
  "pricing",
  "cta",
  "testimonials",
  "cards",
  "forms",
  "dashboard",
  "feature-grid",
  "faq",
  "footer",
  "other",
];

async function loadPatterns(): Promise<PatternListItem[] | null> {
  try {
    const db = getDb();
    return await db
      .select({
        id: patterns.id,
        name: patterns.name,
        category: patterns.category,
        description: patterns.description,
        complexity: patterns.complexity,
        conversionScore: patterns.conversionScore,
      })
      .from(patterns)
      .orderBy(desc(patterns.conversionScore))
      .limit(200);
  } catch {
    return null;
  }
}

function groupByCategory(
  rows: PatternListItem[],
): [string, PatternListItem[]][] {
  const groups = new Map<string, PatternListItem[]>();
  for (const row of rows) {
    const list = groups.get(row.category) ?? [];
    list.push(row);
    groups.set(row.category, list);
  }
  const known = CATEGORY_ORDER.filter((c) => groups.has(c));
  const rest = [...groups.keys()]
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort();
  return [...known, ...rest].map((c) => [c, groups.get(c) ?? []]);
}

export default async function PatternsPage() {
  const rows = await loadPatterns();
  const groups = rows ? groupByCategory(rows) : [];

  return (
    <div>
      <PageHeader
        eyebrow="Reusable knowledge"
        sheet="SHT 03 · LIBRARY"
        title="Patterns"
        meta={rows ? `${rows.length} IN LIBRARY` : undefined}
      />

      {!rows ? (
        <SetupSheet />
      ) : rows.length === 0 ? (
        <EmptySheet title="Library is empty">
          <p>
            Run <code className="codechip">npm run seed</code> to load the
            curated starter patterns, or let the learning engine grow the
            library from project feedback.
          </p>
        </EmptySheet>
      ) : (
        <div className="mt-9 space-y-10">
          {groups.map(([category, items]) => (
            <section key={category} aria-label={`${category} patterns`}>
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-trace">
                  {category}
                </h2>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
                <span className="font-mono text-[10px] text-faint num">
                  {items.length} {items.length === 1 ? "SHEET" : "SHEETS"}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    href={`/patterns/${p.id}`}
                    className="rowlink group flex flex-col p-5"
                  >
                    <h3 className="font-display text-[18px] font-semibold uppercase leading-snug tracking-[0.02em] text-ink transition-colors group-hover:text-trace">
                      {p.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-dim">
                      {p.description}
                    </p>
                    <div className="mt-auto pt-4">
                      <div
                        className="flex items-center gap-3"
                        title={`Conversion score ${p.conversionScore}/100`}
                      >
                        <span className="w-9 shrink-0 font-mono text-[9px] tracking-[0.14em] text-faint">
                          CONV
                        </span>
                        <Meter value={p.conversionScore} />
                        <span className="w-7 shrink-0 text-right font-mono text-[12px] text-ink num">
                          {p.conversionScore}
                        </span>
                      </div>
                      <div
                        className="mt-2 flex items-center gap-3"
                        title={`Complexity ${p.complexity}/5`}
                      >
                        <span className="w-9 shrink-0 font-mono text-[9px] tracking-[0.14em] text-faint">
                          CMPLX
                        </span>
                        <TickScale value={p.complexity} />
                        <span className="ml-auto w-7 shrink-0 text-right font-mono text-[12px] text-faint num">
                          {p.complexity}/5
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
