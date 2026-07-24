import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designMemories, type DesignMemoryRow } from "@/lib/db/schema";
import type { DesignAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LoadResult =
  | { status: "ok"; memory: DesignMemoryRow }
  | { status: "missing" }
  | { status: "no-db" };

async function loadMemory(id: string): Promise<LoadResult> {
  if (!UUID_RE.test(id)) return { status: "missing" };
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(designMemories)
      .where(eq(designMemories.id, id))
      .limit(1);
    return rows[0] ? { status: "ok", memory: rows[0] } : { status: "missing" };
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

function normalizeHex(hex: string): string | null {
  const h = hex.startsWith("#") ? hex : `#${hex}`;
  return /^#[0-9a-fA-F]{3,8}$/.test(h) ? h : null;
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-6 ${className}`}>
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-dim">{children}</p>;
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <span className="font-mono text-[10px] tracking-[0.14em] text-faint">
        {label.toUpperCase()}
      </span>
      <span className="text-right text-sm text-ink">{value}</span>
    </div>
  );
}

const LEVEL_COLOR: Record<string, string> = {
  strong: "text-sage",
  AAA: "text-sage",
  AA: "text-sage",
  moderate: "text-amber",
  "partial-AA": "text-amber",
  weak: "text-rust",
  poor: "text-rust",
};

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

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadMemory(id);

  if (result.status === "no-db") {
    return (
      <div>
        <p className="eyebrow">Memory</p>
        <SetupCard />
      </div>
    );
  }
  if (result.status === "missing") notFound();

  const m = result.memory;
  const a = (m.analysis ?? {}) as Partial<DesignAnalysis>;

  return (
    <div>
      <Link
        href="/memories"
        className="font-mono text-[11px] text-faint transition-colors hover:text-amber"
      >
        ← MEMORIES
      </Link>

      <header className="mt-4">
        <p className="eyebrow">
          {[m.sourceType, m.industry].filter(Boolean).join("  ·  ")}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">
          {m.title}
        </h1>
        <div className="titlerule" />
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {m.brand && <span className="chip">{m.brand}</span>}
          {m.qualityScore !== null && (
            <span className="chip text-amber">quality {m.qualityScore}</span>
          )}
          {a.style && <span className="chip">{a.style}</span>}
          {m.tags.map((t) => (
            <span key={t} className="chip text-faint">
              #{t}
            </span>
          ))}
          <span className="chip text-faint">{fmtDate(m.createdAt)}</span>
        </div>
        {m.sourceRef && (
          <p className="mt-3 break-all font-mono text-[11px] text-faint">
            SOURCE · {m.sourceRef}
          </p>
        )}
      </header>

      {a.summary && (
        <p className="mt-8 max-w-3xl font-display text-xl leading-relaxed text-ink">
          {a.summary}
        </p>
      )}

      {(m.traits.length > 0 || (a.brandPersonality?.length ?? 0) > 0) && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {m.traits.map((t) => (
            <span key={`t-${t}`} className="chip">
              {t}
            </span>
          ))}
          {a.brandPersonality?.map((p) => (
            <span key={`p-${p}`} className="chip text-amber">
              {p}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {a.spacing && (
          <Section title="Spacing">
            <KV label="System" value={a.spacing.system} />
            <KV
              label="Base unit"
              value={a.spacing.baseUnit !== null ? `${a.spacing.baseUnit}px` : "—"}
            />
            <KV label="Section rhythm" value={a.spacing.sectionSpacing} />
            {a.spacing.notes && (
              <div className="mt-3">
                <Note>{a.spacing.notes}</Note>
              </div>
            )}
          </Section>
        )}

        {a.typography && (
          <Section title="Typography">
            <KV label="Heading" value={a.typography.headingFont ?? "—"} />
            <KV label="Body" value={a.typography.bodyFont ?? "—"} />
            <KV label="Scale" value={a.typography.scale} />
            {a.typography.hierarchyNotes && (
              <div className="mt-3">
                <Note>{a.typography.hierarchyNotes}</Note>
              </div>
            )}
          </Section>
        )}

        {a.hierarchy && (
          <Section title="Hierarchy">
            <KV
              label="Strength"
              value={
                <span
                  className={`font-mono text-xs uppercase tracking-[0.12em] ${LEVEL_COLOR[a.hierarchy.strength] ?? "text-ink"}`}
                >
                  {a.hierarchy.strength}
                </span>
              }
            />
            {a.hierarchy.focalPoints.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {a.hierarchy.focalPoints.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-dim">
                    <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rotate-45 bg-edge" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            {a.hierarchy.notes && (
              <div className="mt-3">
                <Note>{a.hierarchy.notes}</Note>
              </div>
            )}
          </Section>
        )}

        {a.grid && (
          <Section title="Grid">
            <KV
              label="Columns"
              value={a.grid.columns !== null ? a.grid.columns : "—"}
            />
            <KV label="Container" value={a.grid.containerWidth ?? "—"} />
            {a.grid.notes && (
              <div className="mt-3">
                <Note>{a.grid.notes}</Note>
              </div>
            )}
          </Section>
        )}
      </div>

      {a.visualRhythm && (
        <Section title="Visual rhythm" className="mt-4">
          <Note>{a.visualRhythm}</Note>
        </Section>
      )}

      {a.colors && a.colors.palette.length > 0 && (
        <Section title="Palette" className="mt-4">
          <div className="flex flex-wrap gap-4">
            {a.colors.palette.map((c, i) => {
              const hex = normalizeHex(c.hex);
              return (
                <div key={`${c.hex}-${i}`} className="w-[76px]">
                  <div
                    className="h-12 w-full rounded-md border border-edge"
                    style={hex ? { backgroundColor: hex } : undefined}
                  />
                  <p className="mt-1.5 font-mono text-[10px] text-dim">
                    {hex ?? c.hex}
                  </p>
                  <p className="font-mono text-[10px] leading-tight text-faint">
                    {c.role}
                  </p>
                </div>
              );
            })}
          </div>
          {a.colors.notes && (
            <div className="mt-4">
              <Note>{a.colors.notes}</Note>
            </div>
          )}
        </Section>
      )}

      {a.componentPatterns && a.componentPatterns.length > 0 && (
        <Section title="Component patterns" className="mt-4">
          <ul className="divide-y divide-line">
            {a.componentPatterns.map((cp, i) => (
              <li key={`${cp.category}-${i}`} className="py-4 first:pt-1 last:pb-1">
                <span className="chip text-amber">{cp.category}</span>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {cp.description}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-dim">
                  {cp.whyItWorks}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {a.animation && (
          <Section title="Animation">
            <KV label="Present" value={a.animation.present ? "yes" : "no"} />
            <KV label="Style" value={a.animation.style} />
            {a.animation.notes && (
              <div className="mt-3">
                <Note>{a.animation.notes}</Note>
              </div>
            )}
          </Section>
        )}

        {a.responsiveness && (
          <Section title="Responsiveness">
            <KV label="Approach" value={a.responsiveness.approach} />
            {a.responsiveness.notes && (
              <div className="mt-3">
                <Note>{a.responsiveness.notes}</Note>
              </div>
            )}
          </Section>
        )}
      </div>

      {a.accessibility && (
        <Section title="Accessibility" className="mt-4">
          <KV
            label="Estimated level"
            value={
              <span
                className={`font-mono text-xs uppercase tracking-[0.12em] ${LEVEL_COLOR[a.accessibility.estimatedLevel] ?? "text-ink"}`}
              >
                {a.accessibility.estimatedLevel}
              </span>
            }
          />
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-sage">
                STRENGTHS
              </p>
              <ul className="mt-2 space-y-1.5">
                {a.accessibility.strengths.length === 0 ? (
                  <li className="text-sm text-faint">None noted</li>
                ) : (
                  a.accessibility.strengths.map((s) => (
                    <li key={s} className="flex gap-2 text-sm text-dim">
                      <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rotate-45 bg-sage" />
                      {s}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-rust">
                ISSUES
              </p>
              <ul className="mt-2 space-y-1.5">
                {a.accessibility.issues.length === 0 ? (
                  <li className="text-sm text-faint">None noted</li>
                ) : (
                  a.accessibility.issues.map((s) => (
                    <li key={s} className="flex gap-2 text-sm text-dim">
                      <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rotate-45 bg-rust" />
                      {s}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {a.lessons && a.lessons.length > 0 && (
        <section className="panel mt-4 border-l-2 border-l-amber p-6">
          <h2 className="eyebrow text-amber">Lessons for the brain</h2>
          <ul className="mt-3 space-y-2.5">
            {a.lessons.map((l) => (
              <li key={l} className="flex gap-3 text-sm leading-relaxed text-ink">
                <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rotate-45 bg-amber" />
                {l}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
