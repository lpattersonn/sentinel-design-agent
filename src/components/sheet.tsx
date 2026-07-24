import Link from "next/link";

/* ---------------------------------------------------------------------------
   Shared presentational pieces for the drafting-room dashboard.
   Server-safe: pure JSX, no client interactivity.
--------------------------------------------------------------------------- */

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Score-breakdown helpers (defensive reads of the jsonb `scores` column)
// ---------------------------------------------------------------------------

export const DIMENSIONS = [
  { key: "visualHierarchy", abbr: "HIER", label: "Visual hierarchy" },
  { key: "accessibility", abbr: "A11Y", label: "Accessibility" },
  { key: "spacing", abbr: "SPACE", label: "Spacing" },
  { key: "consistency", abbr: "CONS", label: "Consistency" },
  { key: "readability", abbr: "READ", label: "Readability" },
  { key: "conversion", abbr: "CONV", label: "Conversion" },
  { key: "mobile", abbr: "MOB", label: "Mobile" },
  { key: "performance", abbr: "PERF", label: "Performance" },
  { key: "modernDesign", abbr: "MOD", label: "Modern design" },
  { key: "animation", abbr: "ANIM", label: "Animation" },
  { key: "componentQuality", abbr: "COMP", label: "Component quality" },
] as const;

export function dimEntry(
  scores: unknown,
  key: string,
): { score: number; reasoning: string | null } | null {
  if (typeof scores !== "object" || scores === null) return null;
  const dim = (scores as Record<string, unknown>)[key];
  if (typeof dim !== "object" || dim === null) return null;
  const value = (dim as { score?: unknown }).score;
  if (typeof value !== "number") return null;
  const reasoning = (dim as { reasoning?: unknown }).reasoning;
  return {
    score: Math.min(100, Math.max(0, Math.round(value))),
    reasoning: typeof reasoning === "string" ? reasoning : null,
  };
}

export function verdictOf(scores: unknown): string {
  if (typeof scores !== "object" || scores === null) return "";
  const v = (scores as { verdict?: unknown }).verdict;
  return typeof v === "string" ? v : "";
}

export function improvementsOf(scores: unknown): string[] {
  if (typeof scores !== "object" || scores === null) return [];
  const list = (scores as { topImprovements?: unknown }).topImprovements;
  if (!Array.isArray(list)) return [];
  return list.filter((x): x is string => typeof x === "string");
}

// ---------------------------------------------------------------------------
// Palette helpers (defensive reads of the jsonb `analysis` column)
// ---------------------------------------------------------------------------

export type PaletteEntry = { hex: string; role: string };

export function normalizeHex(hex: unknown): string | null {
  if (typeof hex !== "string") return null;
  const h = hex.startsWith("#") ? hex : `#${hex}`;
  return /^#[0-9a-fA-F]{3,8}$/.test(h) ? h : null;
}

export function paletteOf(analysis: unknown): PaletteEntry[] {
  if (typeof analysis !== "object" || analysis === null) return [];
  const colors = (analysis as { colors?: unknown }).colors;
  if (typeof colors !== "object" || colors === null) return [];
  const palette = (colors as { palette?: unknown }).palette;
  if (!Array.isArray(palette)) return [];
  const out: PaletteEntry[] = [];
  for (const item of palette) {
    if (typeof item !== "object" || item === null) continue;
    const hex = normalizeHex((item as { hex?: unknown }).hex);
    if (!hex) continue;
    const role = (item as { role?: unknown }).role;
    out.push({ hex, role: typeof role === "string" ? role : "" });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Layout pieces
// ---------------------------------------------------------------------------

export function PageHeader({
  eyebrow,
  sheet,
  title,
  meta,
}: {
  eyebrow: string;
  sheet: string;
  title: string;
  meta?: string;
}) {
  return (
    <header>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="eyebrow">{eyebrow}</p>
        <p className="font-mono text-[10px] tracking-[0.22em] text-faint num">
          {sheet}
        </p>
      </div>
      <h1 className="mt-3 font-display text-[40px] font-semibold uppercase leading-[0.98] tracking-[0.02em] text-balance text-ink md:text-[52px]">
        {title}
      </h1>
      <div className="dimrule" aria-hidden="true" />
      {meta && (
        <p className="mt-2 text-right font-mono text-[10px] tracking-[0.16em] text-faint num">
          {meta}
        </p>
      )}
    </header>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="font-mono text-[11px] tracking-[0.18em] text-faint transition-colors hover:text-trace"
    >
      ← {label}
    </Link>
  );
}

export function SectionPanel({
  letter,
  title,
  className = "",
  children,
}: {
  letter?: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`border border-line bg-panel p-5 md:p-6 ${className}`}>
      <h2 className="flex items-center gap-2.5">
        {letter && (
          <span className="callout" aria-hidden="true">
            {letter}
          </span>
        )}
        <span className="eyebrow">{title}</span>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-mono text-[12px] leading-relaxed text-ink num">
        {value}
      </span>
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] leading-relaxed text-dim">{children}</p>;
}

// ---------------------------------------------------------------------------
// Instruments
// ---------------------------------------------------------------------------

/** Dimension-line meter: hairline track with slash ticks at 0 and value. */
export function Meter({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <span className="meter w-full" aria-hidden="true">
      <span className="meter-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

/** Ruler graduations, e.g. complexity 1–5. */
export function TickScale({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span
      className="inline-flex items-center gap-[5px]"
      role="img"
      aria-label={`${value} of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`tick ${i < value ? "tick-on" : ""}`} />
      ))}
    </span>
  );
}

/** Eleven-dimension profile glyph — one bar per scored dimension. */
export function ScoreGlyph({ scores }: { scores: unknown }) {
  const summary = DIMENSIONS.map((d) => {
    const e = dimEntry(scores, d.key);
    return `${d.label} ${e ? `${e.score} of 100` : "not scored"}`;
  }).join(", ");
  return (
    <span className="flex items-end gap-[3px]" role="img" aria-label={summary}>
      {DIMENSIONS.map((d) => {
        const e = dimEntry(scores, d.key);
        const h = e ? Math.max(2, Math.round((e.score / 100) * 28)) : 0;
        return (
          <span
            key={d.key}
            title={e ? `${d.label} ${e.score}/100` : `${d.label} — not scored`}
            className="relative block h-[28px] w-[6px] bg-raised"
          >
            {e && (
              <span
                className="absolute inset-x-0 bottom-0 block bg-trace"
                style={{ height: `${h}px` }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

/** Compact strip of palette chips — the color spine of a memory row. */
export function PaletteSpine({
  palette,
  limit = 6,
}: {
  palette: PaletteEntry[];
  limit?: number;
}) {
  if (palette.length === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-[3px]"
      role="img"
      aria-label={`Palette: ${palette
        .slice(0, limit)
        .map((p) => p.hex)
        .join(", ")}`}
    >
      {palette.slice(0, limit).map((c, i) => (
        <span
          key={`${c.hex}-${i}`}
          title={c.role ? `${c.hex} — ${c.role}` : c.hex}
          className="h-[13px] w-[13px] border border-edge"
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </span>
  );
}

/** Annotated list with drafting markers: + strength, − issue, / neutral. */
export function MarkList({
  items,
  marker,
  emptyText = "None recorded",
}: {
  items: string[];
  marker: "plus" | "minus" | "slash";
  emptyText?: string;
}) {
  if (items.length === 0)
    return <p className="text-[14px] text-faint">{emptyText}</p>;
  const glyph = marker === "plus" ? "+" : marker === "minus" ? "−" : "/";
  const tone =
    marker === "plus"
      ? "text-trace"
      : marker === "minus"
        ? "text-redline"
        : "text-faint";
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-[14px] leading-relaxed text-dim"
        >
          <span
            className={`select-none font-mono text-[13px] leading-[1.4] ${tone}`}
            aria-hidden="true"
          >
            {glyph}
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Designed empty / disconnected states
// ---------------------------------------------------------------------------

/** Database unreachable or unconfigured — dashed border, drafting's linetype
    for work not yet built. */
export function SetupSheet() {
  return (
    <div className="mt-10 max-w-2xl border border-dashed border-edge p-7 md:p-9">
      <p className="eyebrow text-trace">No archive connected</p>
      <h2 className="mt-3 font-display text-[26px] font-semibold uppercase leading-tight tracking-[0.02em] text-ink">
        The instrument has no data source
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-dim">
        Point <code className="codechip">DATABASE_URL</code> at your Supabase
        Postgres (transaction pooler, port 6543), run the migrations, then seed
        the starter library. Every sheet redraws itself the moment the archive
        answers.
      </p>
      <ol className="mt-6 space-y-2.5 font-mono text-xs text-dim">
        <li>
          <span className="mr-4 text-faint num">01</span>set DATABASE_URL in
          .env
        </li>
        <li>
          <span className="mr-4 text-faint num">02</span>npm run db:migrate
        </li>
        <li>
          <span className="mr-4 text-faint num">03</span>npm run seed
        </li>
      </ol>
    </div>
  );
}

/** Connected, but this table has no rows yet. */
export function EmptySheet({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10 max-w-2xl border border-line bg-panel p-7 md:p-9">
      <p className="eyebrow text-faint">Sheet not yet drawn</p>
      <h2 className="mt-3 font-display text-[24px] font-semibold uppercase leading-tight tracking-[0.02em] text-ink">
        {title}
      </h2>
      <div className="mt-3 text-[15px] leading-relaxed text-dim">{children}</div>
    </div>
  );
}
