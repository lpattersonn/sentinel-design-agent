import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { patterns, type PatternRow } from "@/lib/db/schema";
import {
  BackLink,
  MarkList,
  Meter,
  PageHeader,
  SectionPanel,
  SetupSheet,
  TickScale,
  fmtDate,
} from "@/components/sheet";

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
        <SetupSheet />
      </div>
    );
  }
  if (result.status === "missing") notFound();

  const p = result.pattern;

  return (
    <div>
      <BackLink href="/patterns" label="SHT 03 · PATTERNS" />

      <div className="mt-5">
        <PageHeader
          eyebrow={p.category}
          sheet="SHT 03 · DETAIL"
          title={p.name}
        />
      </div>

      <p className="mt-4 font-mono text-[11px] text-faint">
        {p.slug}
        {"  ·  "}
        <span className="num">{fmtDate(p.createdAt)}</span>
        {p.source && (
          <>
            {"  ·  "}learned from {p.source}
          </>
        )}
      </p>

      {/* Instrument row — the pattern's two measures. */}
      <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:max-w-lg">
        <div
          className="bg-panel px-5 py-5"
          title="Adjusted upward and downward by the learning engine"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-faint">
            CONVERSION
          </p>
          <p className="mt-2 font-display text-[44px] font-semibold leading-none text-ink num">
            {p.conversionScore}
            <span className="ml-1.5 font-mono text-xs font-normal text-faint">
              /100
            </span>
          </p>
          <div className="mt-4">
            <Meter value={p.conversionScore} />
          </div>
        </div>
        <div className="bg-panel px-5 py-5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-faint">
            COMPLEXITY
          </p>
          <p className="mt-2 font-display text-[44px] font-semibold leading-none text-ink num">
            {p.complexity}
            <span className="ml-1.5 font-mono text-xs font-normal text-faint">
              /5
            </span>
          </p>
          <div className="mt-4">
            <TickScale value={p.complexity} />
          </div>
        </div>
      </div>

      <SectionPanel title="Description" className="mt-4">
        <p className="text-[15px] leading-relaxed text-ink">{p.description}</p>
      </SectionPanel>

      <section className="mt-4 border border-line border-l-2 border-l-trace bg-panel p-5 md:p-6">
        <h2 className="eyebrow text-trace">Why it works</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">
          {p.whyItWorks}
        </p>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SectionPanel title="Strengths">
          <MarkList items={p.strengths} marker="plus" />
        </SectionPanel>
        <SectionPanel title="Weaknesses">
          <MarkList items={p.weaknesses} marker="minus" />
        </SectionPanel>
      </div>

      <SectionPanel title="Ideal use cases" className="mt-4">
        <MarkList items={p.idealUseCases} marker="slash" />
        {p.industries.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="font-mono text-[10px] tracking-[0.16em] text-faint">
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
      </SectionPanel>

      {p.spec !== null && p.spec !== undefined && (
        <SectionPanel title="Spec" className="mt-4">
          <pre className="specblock">{JSON.stringify(p.spec, null, 2)}</pre>
        </SectionPanel>
      )}
    </div>
  );
}
