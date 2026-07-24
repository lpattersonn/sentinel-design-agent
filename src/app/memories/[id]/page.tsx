import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designMemories, type DesignMemoryRow } from "@/lib/db/schema";
import type { DesignAnalysis } from "@/lib/types";
import {
  BackLink,
  KV,
  MarkList,
  Note,
  PageHeader,
  SectionPanel,
  SetupSheet,
  fmtDate,
  paletteOf,
} from "@/components/sheet";

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

/** Level → tone for hierarchy strength and accessibility estimate. */
const LEVEL_COLOR: Record<string, string> = {
  strong: "text-trace",
  AAA: "text-trace",
  AA: "text-trace",
  moderate: "text-ink",
  "partial-AA": "text-ink",
  weak: "text-redline",
  poor: "text-redline",
};

function LevelTag({ level }: { level: string }) {
  return (
    <span
      className={`font-mono text-xs uppercase tracking-[0.14em] ${LEVEL_COLOR[level] ?? "text-ink"}`}
    >
      {level}
    </span>
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
        <SetupSheet />
      </div>
    );
  }
  if (result.status === "missing") notFound();

  const m = result.memory;
  const a = (m.analysis ?? {}) as Partial<DesignAnalysis>;
  const palette = paletteOf(m.analysis);

  return (
    <div>
      <BackLink href="/memories" label="SHT 02 · MEMORIES" />

      <div className="mt-5">
        <PageHeader
          eyebrow={[m.sourceType, m.industry].filter(Boolean).join("  ·  ")}
          sheet="SHT 02 · DETAIL"
          title={m.title}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {m.brand && <span className="chip">{m.brand}</span>}
        {m.qualityScore !== null && (
          <span className="chip text-trace num">quality {m.qualityScore}</span>
        )}
        {a.style && <span className="chip">{a.style}</span>}
        {m.tags.map((t) => (
          <span key={t} className="chip text-faint">
            #{t}
          </span>
        ))}
        <span className="chip text-faint num">{fmtDate(m.createdAt)}</span>
      </div>
      {m.sourceRef && (
        <p className="mt-3 break-all font-mono text-[11px] text-faint">
          SOURCE · {m.sourceRef}
        </p>
      )}

      {a.summary && (
        <p className="mt-9 max-w-3xl text-[19px] leading-relaxed text-ink md:text-[20px]">
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
            <span key={`p-${p}`} className="chip text-trace">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* The specimen itself — the palette, shown first and largest. */}
      {palette.length > 0 && (
        <SectionPanel letter="A" title="Palette" className="mt-9">
          <div
            className="flex h-11 w-full border border-edge"
            role="img"
            aria-label={`Palette spectrum: ${palette.map((c) => c.hex).join(", ")}`}
          >
            {palette.map((c, i) => (
              <span
                key={`s-${c.hex}-${i}`}
                title={c.role ? `${c.hex} — ${c.role}` : c.hex}
                className="h-full flex-1 border-r border-line last:border-r-0"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-4">
            {palette.map((c, i) => (
              <div key={`${c.hex}-${i}`} className="w-[86px]">
                <div
                  className="h-14 w-full border border-edge"
                  style={{ backgroundColor: c.hex }}
                />
                <p className="mt-1.5 font-mono text-[10.5px] text-dim num">
                  {c.hex}
                </p>
                {c.role && (
                  <p className="mt-0.5 text-[11.5px] italic leading-tight text-faint">
                    {c.role}
                  </p>
                )}
              </div>
            ))}
          </div>
          {a.colors?.notes && (
            <div className="mt-5">
              <Note>{a.colors.notes}</Note>
            </div>
          )}
        </SectionPanel>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {a.spacing && (
          <SectionPanel letter="B" title="Spacing">
            <KV label="System" value={a.spacing.system ?? "—"} />
            <KV
              label="Base unit"
              value={
                typeof a.spacing.baseUnit === "number"
                  ? `${a.spacing.baseUnit}px`
                  : "—"
              }
            />
            <KV label="Section rhythm" value={a.spacing.sectionSpacing ?? "—"} />
            {a.spacing.notes && (
              <div className="mt-3">
                <Note>{a.spacing.notes}</Note>
              </div>
            )}
          </SectionPanel>
        )}

        {a.typography && (
          <SectionPanel letter="C" title="Typography">
            <KV label="Heading" value={a.typography.headingFont ?? "—"} />
            <KV label="Body" value={a.typography.bodyFont ?? "—"} />
            <KV label="Scale" value={a.typography.scale ?? "—"} />
            {a.typography.hierarchyNotes && (
              <div className="mt-3">
                <Note>{a.typography.hierarchyNotes}</Note>
              </div>
            )}
          </SectionPanel>
        )}

        {a.hierarchy && (
          <SectionPanel letter="D" title="Hierarchy">
            <KV
              label="Strength"
              value={<LevelTag level={a.hierarchy.strength ?? "—"} />}
            />
            {(a.hierarchy.focalPoints?.length ?? 0) > 0 && (
              <div className="mt-3">
                <MarkList
                  items={a.hierarchy.focalPoints ?? []}
                  marker="slash"
                />
              </div>
            )}
            {a.hierarchy.notes && (
              <div className="mt-3">
                <Note>{a.hierarchy.notes}</Note>
              </div>
            )}
          </SectionPanel>
        )}

        {a.grid && (
          <SectionPanel letter="E" title="Grid">
            <KV
              label="Columns"
              value={typeof a.grid.columns === "number" ? a.grid.columns : "—"}
            />
            <KV label="Container" value={a.grid.containerWidth ?? "—"} />
            {a.grid.notes && (
              <div className="mt-3">
                <Note>{a.grid.notes}</Note>
              </div>
            )}
          </SectionPanel>
        )}
      </div>

      {a.visualRhythm && (
        <SectionPanel letter="F" title="Visual rhythm" className="mt-4">
          <Note>{a.visualRhythm}</Note>
        </SectionPanel>
      )}

      {(a.componentPatterns?.length ?? 0) > 0 && (
        <SectionPanel letter="G" title="Component patterns" className="mt-4">
          <ul className="divide-y divide-line">
            {a.componentPatterns?.map((cp, i) => (
              <li
                key={`${cp.category}-${i}`}
                className="py-4 first:pt-0 last:pb-0"
              >
                <span className="chip text-trace">{cp.category}</span>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink">
                  {cp.description}
                </p>
                <p className="mt-1 text-[14px] italic leading-relaxed text-dim">
                  {cp.whyItWorks}
                </p>
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {a.animation && (
          <SectionPanel letter="H" title="Animation">
            <KV label="Present" value={a.animation.present ? "yes" : "no"} />
            <KV label="Style" value={a.animation.style ?? "—"} />
            {a.animation.notes && (
              <div className="mt-3">
                <Note>{a.animation.notes}</Note>
              </div>
            )}
          </SectionPanel>
        )}

        {a.responsiveness && (
          <SectionPanel letter="I" title="Responsiveness">
            <KV label="Approach" value={a.responsiveness.approach ?? "—"} />
            {a.responsiveness.notes && (
              <div className="mt-3">
                <Note>{a.responsiveness.notes}</Note>
              </div>
            )}
          </SectionPanel>
        )}
      </div>

      {a.accessibility && (
        <SectionPanel letter="J" title="Accessibility" className="mt-4">
          <KV
            label="Estimated level"
            value={<LevelTag level={a.accessibility.estimatedLevel ?? "—"} />}
          />
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-trace">
                STRENGTHS
              </p>
              <div className="mt-2.5">
                <MarkList
                  items={a.accessibility.strengths ?? []}
                  marker="plus"
                  emptyText="None noted"
                />
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-redline">
                ISSUES
              </p>
              <div className="mt-2.5">
                <MarkList
                  items={a.accessibility.issues ?? []}
                  marker="minus"
                  emptyText="None noted"
                />
              </div>
            </div>
          </div>
        </SectionPanel>
      )}

      {(a.lessons?.length ?? 0) > 0 && (
        <section className="mt-4 border border-line border-l-2 border-l-trace bg-panel p-5 md:p-6">
          <h2 className="eyebrow text-trace">
            Traced forward — lessons for the brain
          </h2>
          <ul className="mt-4 space-y-2.5">
            {a.lessons?.map((l) => (
              <li
                key={l}
                className="flex gap-3 text-[15px] leading-relaxed text-ink"
              >
                <span
                  className="select-none font-mono text-[13px] leading-[1.5] text-trace"
                  aria-hidden="true"
                >
                  +
                </span>
                <span className="min-w-0">{l}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
