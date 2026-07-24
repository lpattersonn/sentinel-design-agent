import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designMemories } from "@/lib/db/schema";
import {
  EmptySheet,
  PageHeader,
  PaletteSpine,
  SetupSheet,
  fmtDate,
  paletteOf,
} from "@/components/sheet";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Memories" };

type MemoryListItem = {
  id: string;
  title: string;
  industry: string | null;
  brand: string | null;
  sourceType: string;
  traits: string[];
  qualityScore: number | null;
  analysis: unknown;
  createdAt: Date;
};

async function loadMemories(): Promise<MemoryListItem[] | null> {
  try {
    const db = getDb();
    return await db
      .select({
        id: designMemories.id,
        title: designMemories.title,
        industry: designMemories.industry,
        brand: designMemories.brand,
        sourceType: designMemories.sourceType,
        traits: designMemories.traits,
        qualityScore: designMemories.qualityScore,
        analysis: designMemories.analysis,
        createdAt: designMemories.createdAt,
      })
      .from(designMemories)
      .orderBy(desc(designMemories.createdAt))
      .limit(60);
  } catch {
    return null;
  }
}

export default async function MemoriesPage() {
  const memories = await loadMemories();

  return (
    <div>
      <PageHeader
        eyebrow="Analyzed designs"
        sheet="SHT 02 · ARCHIVE"
        title="Memories"
        meta={memories ? `${memories.length} ON RECORD` : undefined}
      />

      {!memories ? (
        <SetupSheet />
      ) : memories.length === 0 ? (
        <EmptySheet title="No memories yet">
          <p>
            Analyze a design to file the first one — call{" "}
            <code className="codechip">analyze_design</code> over MCP with a
            URL, HTML, screenshot, or description, or run{" "}
            <code className="codechip">npm run seed</code> for the reference
            library.
          </p>
        </EmptySheet>
      ) : (
        <ul className="mt-8 space-y-3">
          {memories.map((m) => {
            const palette = paletteOf(m.analysis);
            return (
              <li key={m.id}>
                <Link
                  href={`/memories/${m.id}`}
                  className="rowlink group p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="min-w-0 font-display text-[20px] font-semibold uppercase leading-snug tracking-[0.02em] text-ink transition-colors group-hover:text-trace">
                      {m.title}
                    </h2>
                    <span className="shrink-0 font-mono text-[10px] text-faint num">
                      {fmtDate(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] text-dim">
                    {[m.brand, m.industry, m.sourceType]
                      .filter(Boolean)
                      .join("  ·  ")}
                    {m.qualityScore !== null && (
                      <span className="text-faint num">
                        {"  ·  "}quality {m.qualityScore}
                      </span>
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    {m.traits.length > 0 ? (
                      <span className="flex min-w-0 flex-wrap gap-1.5">
                        {m.traits.slice(0, 6).map((t) => (
                          <span key={t} className="chip">
                            {t}
                          </span>
                        ))}
                        {m.traits.length > 6 && (
                          <span className="chip text-faint num">
                            +{m.traits.length - 6}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="ml-auto">
                      <PaletteSpine palette={palette} limit={7} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
