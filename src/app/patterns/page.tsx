import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { patterns } from "@/lib/db/schema";

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
  const rest = [...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
  return [...known, ...rest].map((c) => [c, groups.get(c) ?? []]);
}

function ComplexityDots({ level }: { level: number }) {
  return (
    <span
      className="inline-flex items-center gap-[3px]"
      title={`Complexity ${level}/5`}
      aria-label={`Complexity ${level} of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-[5px] w-[5px] rotate-45 ${i <= level ? "bg-dim" : "bg-line"}`}
        />
      ))}
    </span>
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
        Postgres, then run <span className="codechip">npm run db:migrate</span>{" "}
        and <span className="codechip">npm run seed</span>.
      </p>
    </div>
  );
}

export default async function PatternsPage() {
  const rows = await loadPatterns();
  const groups = rows ? groupByCategory(rows) : [];

  return (
    <div>
      <header>
        <p className="eyebrow">Reusable knowledge</p>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl tracking-tight text-ink">
            Patterns
          </h1>
          {rows && (
            <span className="font-mono text-[11px] text-faint">
              {rows.length} IN LIBRARY
            </span>
          )}
        </div>
        <div className="titlerule" />
      </header>

      {!rows ? (
        <SetupCard />
      ) : rows.length === 0 ? (
        <div className="panel mt-8 max-w-xl p-8">
          <h2 className="font-display text-xl text-ink">Library is empty</h2>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            Run <span className="codechip">npm run seed</span> to load the
            curated starter patterns, or let the learning engine grow the
            library from feedback.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map(([category, items]) => (
            <section key={category}>
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
                  {category}
                </h2>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] text-faint">
                  {items.length}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    href={`/patterns/${p.id}`}
                    className="rowlink group flex flex-col p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-amber">
                        {p.name}
                      </h3>
                      <span
                        className="shrink-0 text-right"
                        title={`Conversion score ${p.conversionScore}/100`}
                      >
                        <span className="block font-mono text-lg leading-none text-ink">
                          {p.conversionScore}
                        </span>
                        <span className="mt-1 block h-[3px] w-12 rounded-full bg-raised">
                          <span
                            className="block h-full rounded-full bg-amber"
                            style={{
                              width: `${Math.min(100, Math.max(0, p.conversionScore))}%`,
                            }}
                          />
                        </span>
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dim">
                      {p.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <ComplexityDots level={p.complexity} />
                      <span className="font-mono text-[10px] text-faint">
                        CONV / CMPLX
                      </span>
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
