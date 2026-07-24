import type { Metadata } from "next";
import Link from "next/link";
import { isDbConfigured } from "@/lib/db";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sentinel",
    template: "%s · Sentinel",
  },
  description:
    "Design-intelligence drafting room: memories, patterns, scores and insights that teach Claude Code to design better.",
};

/** The sentinel eye as a lens reticle — the watching instrument. */
function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="8.5"
        stroke="var(--color-trace)"
        strokeWidth="1.5"
      />
      <path
        d="M16 4.5v5M16 22.5v5M4.5 16h5M22.5 16h5"
        stroke="var(--color-trace)"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="16" r="2" fill="var(--color-ink)" />
    </svg>
  );
}

const NAV = [
  { no: "01", href: "/", label: "OVERVIEW" },
  { no: "02", href: "/memories", label: "MEMORIES" },
  { no: "03", href: "/patterns", label: "PATTERNS" },
  { no: "04", href: "/scores", label: "SCORES" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const linked = isDbConfigured();

  return (
    <html lang="en">
      <body>
        <a href="#content" className="skiplink">
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col md:flex-row">
          <aside className="border-b border-line md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
            <div className="px-5 py-5 md:px-6 md:py-7">
              <Link href="/" className="flex items-center gap-3">
                <Mark />
                <span>
                  <span className="block font-display text-[17px] font-semibold tracking-[0.3em] text-ink">
                    SENTINEL
                  </span>
                  <span className="mt-0.5 block font-mono text-[9px] tracking-[0.18em] text-faint">
                    DESIGN INTELLIGENCE
                  </span>
                </span>
              </Link>

              <nav
                aria-label="Primary"
                className="mt-5 md:mt-10"
              >
                <p className="hidden font-mono text-[9px] tracking-[0.3em] text-faint md:block">
                  INDEX OF SHEETS
                </p>
                <div className="flex flex-wrap gap-1 md:mt-3 md:flex-col">
                  {NAV.map((item) => (
                    <Link key={item.href} href={item.href} className="navlink">
                      <span className="text-faint num">{item.no}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>

            {/* Title block — the drawing set's identity plate. */}
            <div className="hidden px-6 pb-7 md:mt-auto md:block">
              <div className="border border-line">
                <div className="flex items-baseline justify-between gap-3 px-2.5 py-1.5">
                  <span className="font-mono text-[9px] tracking-[0.18em] text-faint">
                    MODE
                  </span>
                  <span className="font-mono text-[10px] text-dim">
                    read-only
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-line px-2.5 py-1.5">
                  <span className="font-mono text-[9px] tracking-[0.18em] text-faint">
                    ENDPOINT
                  </span>
                  <span className="font-mono text-[10px] text-dim">/mcp</span>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-line px-2.5 py-1.5">
                  <span className="font-mono text-[9px] tracking-[0.18em] text-faint">
                    ARCHIVE
                  </span>
                  <span
                    className={`font-mono text-[10px] ${linked ? "text-trace" : "text-faint"}`}
                  >
                    {linked ? "linked" : "not linked"}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <main id="content" className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
            <div className="sheet mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
