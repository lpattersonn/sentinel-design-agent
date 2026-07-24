import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { patterns, type PatternRow } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LoadResult =
  | { status: "ok"; pattern: PatternRow }
  | { status: "missing" }
  | { status: "no-db" };

async function loadPattern(id: string): Promise<LoadResult> {
  if (!UUID_RE.test(id)) return { status: "missing" };
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(patterns)
      .where(eq(patterns.id, id))
      .limit(1);
    return rows[0] ? { status: "ok", pattern: rows[0] } : { status: "missing" };
  } catch {
    return { status: "no-db" };
  }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BulletList({
  items,
  tone,
}: {
  items: string[];
  tone: "sage" | "rust" | "dim";
}) {
  const dot =
    tone === "sage" ? "bg-sage" : tone === "rust" ? "bg-rust" : "bg-edge";
  if (items.length === 0)
    return <p className="text-sm text-faint">None recorded</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-dim">
          <span className={`mt-[7px] h-[5px] w-[5px] shrink-0 rotate-45 ${dot}`} />
          {item}
        </li>
      ))}
    </ul>
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

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadPattern(id);

  if (result.status === "no-db") {
    return (
      <div>
        <p className="eyebrow">Pattern</p>
        <SetupCard />
      </div>
    );
  }
  if (result.status === "missing") notFound();

  const p = result.pattern;

  return (
    <div>
      <Link
        href="/patterns"
        className="font-mono text-[11px] text-faint transition-colors hover:text-amber"
      >
        ← PATTERNS
      </Link>

      <header className="mt-4">
        <p className="eyebrow text-amber">{p.category}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">
          {p.name}
        </h1>
        <div className="titlerule" />
        <p className="mt-4 font-mono text-[11px] text-faint">
          {p.slug}
          {"  ·  "}
          {fmtDate(p.createdAt)}
          {p.source && (
            <>
              {"  ·  "}learned from {p.source}
            </>
          )}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="panel px-4 py-4" title="Adjusted upward and downward by the learning engine">
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint">
            CONVERSION SCORE
          </p>
          <p className="mt-2 font-display text-4xl leading-none text-ink">
            {p.conversionScore}
            <span className="ml-1 font-mono text-xs text-faint">/100</span>
          </p>
          <span className="mt-3 block h-[3px] w-full rounded-full bg-raised">
            <span
              className="block h-full rounded-full bg-amber"
              style={{
                width: `${Math.min(100, Math.max(0, p.conversionScore))}%`,
              }}
            />
          </span>
        </div>
        <div className="panel px-4 py-4">
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint">
            COMPLEXITY
          </p>
          <p className="mt-2 font-display text-4xl leading-none text-ink">
            {p.complexity}
            <span className="ml-1 font-mono text-xs text-faint">/5</span>
          </p>
          <span
            className="mt-3 flex items-center gap-1"
            aria-label={`Complexity ${p.complexity} of 5`}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`h-[6px] w-[6px] rotate-45 ${i <= p.complexity ? "bg-dim" : "bg-line"}`}
              />
            ))}
          </span>
        </div>
      </div>

      <section className="panel mt-4 p-6">
        <h2 className="eyebrow">Description</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink">{p.description}</p>
      </section>

      <section className="panel mt-4 border-l-2 border-l-amber p-6">
        <h2 className="eyebrow text-amber">Why it works</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink">{p.whyItWorks}</p>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="panel p-6">
          <h2 className="font-mono text-[10px] tracking-[0.14em] text-sage">
            STRENGTHS
          </h2>
          <div className="mt-3">
            <BulletList items={p.strengths} tone="sage" />
          </div>
        </section>
        <section className="panel p-6">
          <h2 className="font-mono text-[10px] tracking-[0.14em] text-rust">
            WEAKNESSES
          </h2>
          <div className="mt-3">
            <BulletList items={p.weaknesses} tone="rust" />
          </div>
        </section>
      </div>

      <section className="panel mt-4 p-6">
        <h2 className="eyebrow">Ideal use cases</h2>
        <div className="mt-3">
          <BulletList items={p.idealUseCases} tone="dim" />
        </div>
        {p.industries.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-faint">
              INDUSTRIES
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.industries.map((ind) => (
                <span key={ind} className="chip">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {p.spec !== null && p.spec !== undefined && (
        <section className="panel mt-4 p-6">
          <h2 className="eyebrow">Spec</h2>
          <pre className="specblock mt-3">
            {JSON.stringify(p.spec, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
