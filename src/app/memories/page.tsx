import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { designMemories } from "@/lib/db/schema";

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
        createdAt: designMemories.createdAt,
      })
      .from(designMemories)
      .orderBy(desc(designMemories.createdAt))
      .limit(100);
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
        the starter library.
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

export default async function MemoriesPage() {
  const memories = await loadMemories();

  return (
    <div>
      <header>
        <p className="eyebrow">Analyzed designs</p>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl tracking-tight text-ink">
            Memories
          </h1>
          {memories && (
            <span className="font-mono text-[11px] text-faint">
              {memories.length} ON RECORD
            </span>
          )}
        </div>
        <div className="titlerule" />
      </header>

      {!memories ? (
        <SetupCard />
      ) : memories.length === 0 ? (
        <div className="panel mt-8 max-w-xl p-8">
          <h2 className="font-display text-xl text-ink">No memories yet</h2>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            Analyze a design to create the first one — call{" "}
            <span className="codechip">analyze_design</span> over MCP with a
            URL, HTML, screenshot, or description, or run{" "}
            <span className="codechip">npm run seed</span> for the reference
            library.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {memories.map((m) => (
            <li key={m.id}>
              <Link href={`/memories/${m.id}`} className="rowlink group p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="min-w-0 truncate font-display text-xl text-ink transition-colors group-hover:text-amber">
                    {m.title}
                  </h2>
                  <span className="shrink-0 font-mono text-[10px] text-faint">
                    {fmtDate(m.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-dim">
                  {[m.brand, m.industry, m.sourceType]
                    .filter(Boolean)
                    .join("  ·  ")}
                  {m.qualityScore !== null && (
                    <span className="text-faint">
                      {"  ·  "}quality {m.qualityScore}
                    </span>
                  )}
                </p>
                {m.traits.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.traits.slice(0, 6).map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                    {m.traits.length > 6 && (
                      <span className="chip text-faint">
                        +{m.traits.length - 6}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
